export function isKnowledgeBaseQuestionArgs(args: unknown): args is { question: string } {
    return (
        typeof args === 'object' &&
        args !== null &&
        'question' in args &&
        typeof (args as { question?: unknown }).question === 'string'
    );
}
