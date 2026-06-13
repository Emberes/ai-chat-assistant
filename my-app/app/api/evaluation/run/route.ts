import { NextResponse } from 'next/server';
import { runEvaluation } from '@/app/lib/evaluation/runEvaluation';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (key !== process.env.SEED_SECRET) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        const results = await runEvaluation();

        const passedCount = results.filter((result) => result.passed).length;

        return NextResponse.json({
            ok: true,
            total: results.length,
            passed: passedCount,
            failed: results.length - passedCount,
            results,
        });
    } catch (error) {
        console.error('Evaluation error:', error);

        return NextResponse.json(
            {
                ok: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}
