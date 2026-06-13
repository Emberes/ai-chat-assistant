import { findMostSimilarQuestion } from '@/app/lib/askAI/embeddings/semanticDemo';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const query = 'Hur köper man Harry Boy?';

        const result = await findMostSimilarQuestion(query);

        return NextResponse.json({
            ok: true,
            ...result,
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
