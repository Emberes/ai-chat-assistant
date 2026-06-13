import type OpenAI from 'openai';

export const knowledgeBaseFunctionSchema = {
    type: 'function',
    name: 'get_knowledge_base',
    description:
        'Use this to search the knowledge base for broader contextual information about trotting, game types, terms, rules, and related concepts. Use this when the user asks for explanations, comparisons, background information, definitions, or when a FAQ answer needs extra context. This tool should be used together with get_faq_question when the user asks a common FAQ question but also wants a fuller explanation.',
    strict: true,
    parameters: {
        type: 'object',
        properties: {
            question: {
                type: 'string',
                description:
                    'The user question or topic to search for in the knowledge base, for example a question about Harry Boy, V64, V85, trotting concepts, game types, rules, or comparisons between terms.',
            },
        },
        required: ['question'],
        additionalProperties: false,
    },
} satisfies OpenAI.Responses.Tool;
