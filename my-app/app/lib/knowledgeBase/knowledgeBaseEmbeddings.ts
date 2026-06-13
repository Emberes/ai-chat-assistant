import { createEmbedding } from '../askAI/embeddings/embeddings';

export async function createKnowledgeBaseEmbedding(text: string): Promise<number[]> {
    return createEmbedding(text);
}
