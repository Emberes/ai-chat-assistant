export function isFaqQuestionArgs(args: unknown): args is { question: string } {
    if (!args || typeof args !== 'object') return false;

    const candidate = args as Record<string, unknown>;

    return typeof candidate.question === 'string';
}
