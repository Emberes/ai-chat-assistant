import { ResponseFunctionCall } from './types';

export function isFunctionCall(item: unknown): item is ResponseFunctionCall {
    if (!item || typeof item !== 'object') return false;

    const candidate = item as Record<string, unknown>;

    return (
        candidate.type === 'function_call' &&
        typeof candidate.call_id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.arguments === 'string'
    );
}
