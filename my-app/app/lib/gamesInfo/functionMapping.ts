import { isValidISODate } from '../askAI/dates';
import type { FunctionMapping } from '../askAI/types';
import type { GameArgs } from './types';

function isValidView(v: unknown): v is 'ai' | 'raw' {
    return v === 'ai' || v === 'raw';
}

export const function_mapping: Record<string, FunctionMapping> = {
    get_game_info: async (args, ctx) => {
        const a = args as Partial<GameArgs>;

        const id = String(a.id ?? '').trim();
        const horse = String(a.horse ?? '').trim();

        if (id) {
            const url = new URL(`${ctx.baseUrl}/api/games`);
            url.searchParams.set('id', id);
            if (horse) url.searchParams.set('horse', horse);
            const res = await fetch(url.toString(), {
                cache: 'no-store',
                headers: {
                    'x-langfuse-trace-id': ctx.traceId,
                    'x-langfuse-session-id': ctx.sessionId,
                },
            });

            const text = await res.text();
            return res.ok
                ? text
                : JSON.stringify({
                      error: 'Games endpoint not-ok',
                      status: res.status,
                      bodyPreview: text.slice(0, 500),
                  });
        }

        const game = String(a.game ?? '').trim();
        const date = String(a.date ?? '').trim();
        const trackId = String(a.trackId ?? '').trim();
        const raceNumber = String(a.raceNumber ?? '').trim();
        const view: 'ai' | 'raw' = isValidView(a.view) ? a.view : 'ai';

        if (!game || !date || !trackId || !raceNumber) {
            console.log('Missing args:', { game, date, trackId, raceNumber, view });
            return JSON.stringify({
                error: 'Missing required args. Expected game, date, trackId, raceNumber.',
                got: { game, date, trackId, raceNumber, view },
            });
        }

        if (!isValidISODate(date)) {
            console.log('Invalid date format:', date);
            return JSON.stringify({
                error: 'Invalid date format. Expected YYYY-MM-DD.',
                got: date,
            });
        }

        const url = new URL(`${ctx.baseUrl}/api/games`);
        url.searchParams.set('game', game);
        url.searchParams.set('date', date);
        url.searchParams.set('trackId', trackId);
        url.searchParams.set('raceNumber', raceNumber);
        if (horse) url.searchParams.set('horse', horse);

        const res = await fetch(url.toString(), {
            cache: 'no-store',
            headers: {
                'x-langfuse-trace-id': ctx.traceId,
                'x-langfuse-session-id': ctx.sessionId,
            },
        });

        const text = await res.text();

        if (!res.ok) {
            console.log('Games endpoint not ok:', res.status, text.slice(0, 200));
            return JSON.stringify({
                error: 'Games endpoint returned not-ok',
                status: res.status,
                bodyPreview: text.slice(0, 500),
                request: {
                    game,
                    date,
                    trackId,
                    raceNumber,
                    horse,
                    view,
                },
            });
        }

        return text;
    },
};
