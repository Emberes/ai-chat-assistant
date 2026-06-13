import { NextResponse } from 'next/server';
import { seedFaqs } from '@/app/lib/faq/seedFaq';

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

        await seedFaqs();

        return NextResponse.json({
            ok: true,
            message: 'FAQ data seeded successfully.',
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
