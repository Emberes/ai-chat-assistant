import type OpenAI from 'openai';

export const knowledgeGapsFunctionSchema = {
    type: 'function',
    name: 'get_knowledge_gaps',
    description:
        'Use this to list open knowledge gaps. Knowledge gaps are user questions that could not be answered well by the knowledge base. Use this when the user asks what information is missing, what unanswered questions exist, or what should be added to the knowledge base.',
    strict: true,
    parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
    },
} satisfies OpenAI.Responses.Tool;
