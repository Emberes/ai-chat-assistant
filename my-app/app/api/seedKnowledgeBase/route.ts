import { NextResponse } from 'next/server';
import { seedKnowledgeBase } from '@/app/lib/knowledgeBase/seedKnowledgeBase';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const seedKey = searchParams.get('key');

        if (seedKey !== process.env.SEED_SECRET) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        await seedKnowledgeBase();

        return NextResponse.json({
            ok: true,
            message: 'Knowledge base data seeded successfully.',
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
