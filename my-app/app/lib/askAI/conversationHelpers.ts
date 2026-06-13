import type { ChatHistoryMessage } from './types';

export function getCleanedConversation(
    messages: ChatHistoryMessage[] | undefined,
    question: string
): ChatHistoryMessage[] {
    const conversation =
        messages && messages.length > 0 ? messages : [{ role: 'user' as const, content: question }];

    return conversation.filter((m, index, arr) => {
        if (m.role !== 'assistant') return true;

        const c = (m.content ?? '').trim().toLowerCase();
        const isDuplicate = arr
            .slice(0, index)
            .some((prev) => prev.role === 'assistant' && prev.content === m.content);

        if (isDuplicate) return false;

        if (
            c.includes('vad kan jag hjälpa dig med') ||
            c.includes('inte möjlighet att hämta information')
        ) {
            return false;
        }

        const prev = arr[index - 1];
        if (prev?.role === 'user' && c === prev.content.trim().toLowerCase()) {
            return false;
        }

        return true;
    });
}
