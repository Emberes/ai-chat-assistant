import { benchmarkQuestions } from './benchmarkQuestions';
import { cosineSimilarity } from './cosineSimilarity';
import type { EvaluationResult } from './types';
import { createEmbedding } from '@/app/lib/askAI/embeddings/embeddings';

const API_URL = process.env.EVALUATION_API_URL ?? 'http://localhost:3000/api/askAI';

async function askAgent(question: string): Promise<string> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
        answer?: string;
    };

    if (!data.answer) {
        throw new Error('No answer returned from API');
    }

    return data.answer;
}

export async function runEvaluation(): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = [];

    for (const item of benchmarkQuestions) {
        console.log(`Running benchmark: ${item.id}`);

        const modelAnswer = await askAgent(item.question);

        const referenceEmbedding = await createEmbedding(item.referenceAnswer);
        const modelAnswerEmbedding = await createEmbedding(modelAnswer);

        const similarity = cosineSimilarity(referenceEmbedding, modelAnswerEmbedding);

        const passed = similarity >= 0.75;

        const result: EvaluationResult = {
            id: item.id,
            question: item.question,
            referenceAnswer: item.referenceAnswer,
            modelAnswer,
            similarity,
            passed,
            expectedTool: item.expectedTool,
        };

        results.push(result);

        console.log({
            id: result.id,
            similarity: result.similarity,
            passed: result.passed,
        });
    }

    return results;
}
