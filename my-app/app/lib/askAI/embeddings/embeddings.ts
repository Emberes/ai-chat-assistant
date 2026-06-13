import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function createEmbedding(text: string): Promise<number[]> {
    const input = text.trim();

    if (!input) {
        throw new Error('Text is required to create an embedding.');
    }

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input,
        encoding_format: 'float',
    });

    const embedding = response.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
        throw new Error('No embedding returned from OpenAI.');
    }

    return embedding;
}
