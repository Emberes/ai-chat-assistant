import { NextResponse } from 'next/server';
import { langfuse } from '@/app/lib/langfuse';
import type { AtgGameResponse } from '@/app/lib/gamesInfo/types';
import { parseGamesQuery, resolveGamesQuery } from '@/app/lib/gamesInfo/query';
import { buildGameId, buildGamesUrl } from '@/app/lib/gamesInfo/url';
import { toAiShape } from '@/app/lib/gamesInfo/transform';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const parentTraceId = req.headers.get('x-langfuse-trace-id');
    const q = parseGamesQuery(req);
    const resolved = resolveGamesQuery(q);

    const trace = parentTraceId
        ? langfuse.trace({ id: parentTraceId })
        : langfuse.trace({
              name: 'games-api-request',
              input: { query: q },
          });

    const span = trace.span({
        name: 'get_game_info',
        input: { query: q },
    });

    try {
        if ('error' in resolved) {
            span.update({ output: { ok: false, status: resolved.status, reason: resolved.error } });
            return NextResponse.json({ message: resolved.error }, { status: resolved.status });
        }

        const ATG_GAMES_API_URL = process.env.ATG_GAMES_API_URL;
        if (!ATG_GAMES_API_URL) {
            span.update({
                output: { ok: false, status: 500, reason: 'missing-env', key: 'ATG_GAMES_API_URL' },
            });
            return NextResponse.json(
                { message: 'ATG_GAMES_API_URL saknas i .env.local' },
                { status: 500 }
            );
        }

        const atgUrl = buildGamesUrl(ATG_GAMES_API_URL, resolved);
        const effectiveId = resolved.mode === 'id' ? resolved.id : buildGameId(resolved);

        const fetchSpan = span.span({
            name: 'fetch-atg-game',
            input: { url: atgUrl },
        });

        let res: Response;
        let text: string;

        console.log('Resolved query:', resolved);
        console.log('Built game id:', effectiveId);
        console.log('ATG games URL:', atgUrl);

        console.log('Game parts:', {
            game: resolved.mode === 'parts' ? resolved.game : null,
            date: resolved.mode === 'parts' ? resolved.date : null,
            trackId: resolved.mode === 'parts' ? resolved.trackId : null,
            raceNumber: resolved.mode === 'parts' ? resolved.raceNumber : null,
        });

        try {
            res = await fetch(atgUrl, {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            });
            console.log('ATG games URL:', atgUrl);

            text = await res.text();

            fetchSpan.update({
                output: { ok: res.ok, status: res.status, bytes: text.length },
            });

            if (!res.ok) {
                fetchSpan.update({
                    level: 'ERROR',
                    output: { message: 'ATG responded not ok', status: res.status },
                });

                span.update({ output: { ok: false, status: res.status, reason: 'atg-error' } });

                return NextResponse.json(
                    {
                        message: 'Could not get game data',
                        status: res.status,
                        atgUrl,
                        effectiveId,
                        request: resolved,
                    },
                    { status: res.status }
                );
            }
        } catch (error) {
            fetchSpan.update({ level: 'ERROR', output: { error: String(error) } });
            span.update({
                output: { ok: false, status: 500, reason: 'fetch-exception', error: String(error) },
            });
            throw error;
        } finally {
            fetchSpan.end();
        }

        let raw: AtgGameResponse;

        try {
            raw = JSON.parse(text) as AtgGameResponse;
        } catch (error) {
            return NextResponse.json(
                {
                    message: 'Invalid JSON from ATG',
                    error: String(error),
                    bodyPreview: text.slice(0, 500),
                    atgUrl,
                },
                { status: 500 }
            );
        }
        if (resolved.view === 'raw') {
            span.update({ output: { ok: true, status: 200, mode: 'raw', id: effectiveId } });
            return NextResponse.json(raw);
        }

        const ai = toAiShape(raw, effectiveId, resolved.horse);

        span.update({
            output: {
                ok: true,
                status: 200,
                mode: 'ai',
                id: effectiveId,
                matchCount: ai.matchCount,
            },
        });

        return NextResponse.json(ai);
    } catch (error) {
        span.update({ output: { ok: false, status: 500, error: (error as Error).message } });
        return NextResponse.json(
            { message: 'Internal server error', error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        span.end();
        langfuse.flush();
    }
}
