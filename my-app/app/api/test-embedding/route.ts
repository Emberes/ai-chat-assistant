import { NextResponse } from 'next/server';
import { createEmbedding } from '@/app/lib/askAI/embeddings/embeddings';
import { cosineSimilarity } from '@/app/lib/askAI/embeddings/compareEmbeddings';

export async function GET() {
    try {
        const textA = 'Vilka lopp går på Boden idag?';
        const textB = 'Vilka race går på Boden idag?';
        const textC = 'Vem tränar hästen My Goodwill?';

        const embeddingA = await createEmbedding(textA);
        const embeddingB = await createEmbedding(textB);
        const embeddingC = await createEmbedding(textC);

        const similarityAB = cosineSimilarity(embeddingA, embeddingB);
        const similarityAC = cosineSimilarity(embeddingA, embeddingC);

        return NextResponse.json({
            ok: true,
            textA,
            textB,
            textC,
            similarityAB,
            similarityAC,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
