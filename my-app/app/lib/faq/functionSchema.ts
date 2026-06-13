import type OpenAI from 'openai';

export const faqFunctionSchema = {
    type: 'function',
    name: 'get_faq_question',
    description:
        'Use this for common FAQ-style questions stored in the FAQ database when the user needs a direct standard answer, such as how Harry Boy works, what V64 or V85 means, when play stop happens, and common ATG help questions. This tool gives a concise standard answer. If the user asks for broader explanation, comparison, background, or extra context, also consider using get_knowledge_base.',
    strict: true,
    parameters: {
        type: 'object',
        properties: {
            question: {
                type: 'string',
                description:
                    'The user FAQ-style question to search for in the FAQ database, for example a question about Harry Boy, V64, V85, play stop, or general ATG help content.',
            },
        },
        required: ['question'],
        additionalProperties: false,
    },
} satisfies OpenAI.Responses.Tool;
