import { createEmbedding } from '../askAI/embeddings/embeddings';

export async function createFaqEmbedding(question: string): Promise<number[]> {
    return createEmbedding(question);
}
