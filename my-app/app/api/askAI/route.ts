import OpenAI from 'openai';
import { observeOpenAI } from '@langfuse/openai';
import { NextResponse } from 'next/server';
import { getSystemPromptFromLangfuse } from '@/app/lib/langfusePrompts';
import { langfuse } from '@/app/lib/langfuse';
import type { Body, FunctionCallOutputItem } from '@/app/lib/askAI/types';
import { buildSwedishDateContext, getTodaysDateOfStockholm } from '@/app/lib/askAI/dates';
import { tools } from '@/app/lib/askAI/tools';
import { function_mapping } from '@/app/lib/askAI/functionMapping';
import { buildConversationMemory } from '@/app/lib/askAI/memory';
import { buildFixedToolArgs } from '@/app/lib/askAI/toolArgs';
import { isFunctionCall } from '@/app/lib/askAI/responseGuards';
import { getCleanedConversation } from '@/app/lib/askAI/conversationHelpers';
import { saveChatToGoogleSheet } from '@/app/google/sheetsService';

export const runtime = 'nodejs';

const openai = observeOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

export async function POST(req: Request) {
    const parentTraceId = req.headers.get('x-langfuse-trace-id');
    const body = (await req.json()) as Body;

    const effectiveSessionId =
        body.sessionId ?? req.headers.get('x-langfuse-session-id') ?? crypto.randomUUID();

    const trace = langfuse.trace({
        id: parentTraceId ?? undefined,
        name: 'race-api-chat',
        metadata: { route: '/api/askAI', method: 'POST' },
        sessionId: effectiveSessionId,
    });

    try {
        const question = body.question?.trim();
        trace.update({ input: question });

        if (!question) {
            trace.update({ output: { ok: false, status: 400, reason: 'missing-question' } });
            return NextResponse.json(
                { error: 'Question is required', sessionId: effectiveSessionId },
                { status: 400 }
            );
        }

        const todaysDate = getTodaysDateOfStockholm();
        const dateContext = buildSwedishDateContext(todaysDate);

        const promptsSpan = trace.span({
            name: 'load-prompts',
            input: { todaysDate, dateContext },
        });

        let systemPrompt: string;

        try {
            systemPrompt = await getSystemPromptFromLangfuse(dateContext);

            promptsSpan.update({
                output: {
                    systemPromptChars: systemPrompt.length,
                },
            });
        } finally {
            promptsSpan.end();
        }
        const cleanedConversation = getCleanedConversation(body.messages, question);
        const conversationMemory = buildConversationMemory(cleanedConversation);
        const localKnowledgeGapRules = `Regler för knowledge gaps:
                - Om get_knowledge_base returnerar knowledgeFound: false och knowledgeGapSaved: true, betyder det att kunskapsbasen saknar en verifierad träff.
                - I det fallet får du ge ett generellt svar om du är säker på ämnet.
                - Börja svaret med: "Jag hittar ingen verifierad träff i kunskapsbasen just nu, men generellt..."
                - Hitta inte på detaljer som datum, regler, odds, utbetalningar eller specifika ATG-villkor om de inte kommer från ett tool-resultat.`;
        const instructions =
            `${systemPrompt}\n\n` +
            `${localKnowledgeGapRules}\n\n` +
            `Tidigare relevant kontext i samtalet: ${conversationMemory}. ` +
            `Använd denna kontext för att tolka följdfrågor som "där", "det loppet", "den banan" eller "idag", men bara om det är tydligt och rimligt.`;

        const baseUrl = new URL(req.url).origin;

        let iteration = 0;
        const maxIterations = 6;

        let response = await openai.responses.create({
            model: 'gpt-4o-mini',
            instructions,
            input: question,
            previous_response_id: body.previousResponseId,
            tools,
        });

        while (iteration < maxIterations) {
            iteration++;

            const generation = trace.generation({
                name: `openai-response-iteration-${iteration}`,
                model: 'gpt-4o-mini',
                input: {
                    question,
                    responseId: response.id,
                    previousResponseId: body.previousResponseId ?? null,
                    iteration,
                },
            });

            const toolCalls = (response.output ?? []).filter(isFunctionCall);

            generation.update({
                output: {
                    responseId: response.id,
                    outputCount: response.output?.length ?? 0,
                    outputTypes: (response.output ?? []).map((item) =>
                        typeof item === 'object' && item && 'type' in item ? item.type : 'unknown'
                    ),
                    textPreview: response.output_text?.slice(0, 200) ?? '',
                    toolCallCount: toolCalls.length,
                },
            });
            generation.end();

            if (toolCalls.length === 0) {
                break;
            }

            const toolsSpan = trace.span({
                name: `tools-execution-${iteration}`,
                input: toolCalls.map((tc) => ({
                    call_id: tc.call_id,
                    name: tc.name,
                    arguments: tc.arguments,
                })),
            });

            try {
                const toolOutputs: FunctionCallOutputItem[] = [];
                const toolResults: Array<{
                    call_id: string;
                    name: string;
                    ok: boolean;
                    argsPreview?: Record<string, unknown>;
                    outputPreview: string;
                }> = [];

                for (const tc of toolCalls) {
                    const toolName = tc.name;
                    const handler = function_mapping[toolName];

                    console.log(`Tool-call: ${toolName} args:`, tc.arguments);

                    if (!handler) {
                        const output = JSON.stringify({ error: `No handler for ${toolName}` });

                        toolOutputs.push({
                            type: 'function_call_output',
                            call_id: tc.call_id,
                            output,
                        });

                        toolResults.push({
                            call_id: tc.call_id,
                            name: toolName,
                            ok: false,
                            outputPreview: output.slice(0, 300),
                        });

                        continue;
                    }

                    let raw: Record<string, unknown> = {};

                    try {
                        const parsed = tc.arguments ? JSON.parse(tc.arguments) : {};
                        raw =
                            parsed && typeof parsed === 'object'
                                ? (parsed as Record<string, unknown>)
                                : {};
                    } catch {
                        const output = JSON.stringify({
                            error: `Invalid JSON arguments for ${toolName}`,
                        });
                        toolOutputs.push({
                            type: 'function_call_output',
                            call_id: tc.call_id,
                            output,
                        });
                        toolResults.push({
                            call_id: tc.call_id,
                            name: toolName,
                            ok: false,
                            outputPreview: output.slice(0, 300),
                        });
                        continue;
                    }

                    const built = buildFixedToolArgs(toolName, raw, todaysDate);

                    if (!built.ok) {
                        if ('missing' in built) {
                            const output = JSON.stringify({
                                error: `Missing required parameters for ${toolName}`,
                                missing: built.missing,
                            });

                            toolOutputs.push({
                                type: 'function_call_output',
                                call_id: tc.call_id,
                                output,
                            });

                            toolResults.push({
                                call_id: tc.call_id,
                                name: toolName,
                                ok: false,
                                argsPreview: raw,
                                outputPreview: output.slice(0, 800),
                            });

                            continue;
                        }

                        const output = JSON.stringify({ error: built.error });

                        toolOutputs.push({
                            type: 'function_call_output',
                            call_id: tc.call_id,
                            output,
                        });

                        toolResults.push({
                            call_id: tc.call_id,
                            name: toolName,
                            ok: false,
                            argsPreview: raw,
                            outputPreview: output.slice(0, 300),
                        });

                        continue;
                    }

                    const fixedArgs = built.fixedArgs;
                    const output = await handler(fixedArgs, {
                        baseUrl,
                        traceId: trace.id,
                        sessionId: effectiveSessionId,
                    });

                    console.log(`Tool call result: ${toolName}`, {
                        toolName,
                        args: fixedArgs,
                        outputPreview: output.slice(0, 800),
                    });

                    toolOutputs.push({
                        type: 'function_call_output',
                        call_id: tc.call_id,
                        output,
                    });

                    toolResults.push({
                        call_id: tc.call_id,
                        name: toolName,
                        ok: true,
                        argsPreview: fixedArgs as Record<string, unknown>,
                        outputPreview: output.slice(0, 800),
                    });
                }

                toolsSpan.update({
                    output: {
                        toolCount: toolResults.length,
                        tools: toolResults,
                    },
                });

                response = await openai.responses.create({
                    model: 'gpt-4o-mini',
                    instructions,
                    previous_response_id: response.id,
                    input: toolOutputs,
                    tools,
                });
            } finally {
                toolsSpan.end();
            }
        }

        const loopAnswer = response.output_text || 'Inget svar kunde genereras.';

        console.log('Final answer returned to frontend:', loopAnswer);

        saveChatToGoogleSheet(question, loopAnswer);

        trace.update({
            output: {
                answerPreview: loopAnswer.slice(0, 200),
                iterationsUsed: iteration,
                responseId: response.id,
            },
        });

        return NextResponse.json(
            {
                answer: loopAnswer,
                sessionId: effectiveSessionId,
                responseId: response.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('OpenAI Error:', error);
        trace.update({
            output: { ok: false, status: 500, reason: 'unhandled', error: String(error) },
        });
        return NextResponse.json(
            { error: 'Failed to process request', sessionId: effectiveSessionId },
            { status: 500 }
        );
    } finally {
        langfuse.flush();
    }
}
