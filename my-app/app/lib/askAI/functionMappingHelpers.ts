import { RaceApiRaw, ToolContext } from './types';

export function buildHeaders(ctx: ToolContext) {
    return {
        'x-langfuse-trace-id': ctx.traceId,
        'x-langfuse-session-id': ctx.sessionId,
    };
}

export async function fetchText(url: URL, ctx: ToolContext) {
    const res = await fetch(url.toString(), {
        cache: 'no-store',
        headers: buildHeaders(ctx),
    });

    const text = await res.text();

    return {
        ok: res.ok,
        status: res.status,
        text,
    };
}

export function normalize(str: string) {
    return str.trim().toLowerCase();
}

export function findTrackByName(raceData: RaceApiRaw, trackName: string) {
    return (raceData.tracks ?? []).find((t) => normalize(t.name) === normalize(trackName));
}

export function resolveGameIdForRace(
    raceData: {
        games?: Record<string, { id?: string; races?: string[]; tracks?: number[] }[]>;
    },
    requestedGameType: string,
    trackId: number,
    raceNumber: number,
    date: string,
    findGameIdForRaceFn: (
        raw: {
            games?: Record<string, { id?: string; races?: string[]; tracks?: number[] }[]>;
        },
        gameType: string,
        trackId: number,
        raceNumber: number,
        date: string
    ) => string | null
): { gameId: string | null; resolvedGameType: string | null } {
    const requestedGameId = findGameIdForRaceFn(
        raceData,
        requestedGameType,
        trackId,
        raceNumber,
        date
    );

    if (requestedGameId) {
        return {
            gameId: requestedGameId,
            resolvedGameType: requestedGameType,
        };
    }

    const availableGameTypes = Object.keys(raceData.games ?? {});

    for (const gameType of availableGameTypes) {
        const fallbackGameId = findGameIdForRaceFn(raceData, gameType, trackId, raceNumber, date);

        if (fallbackGameId) {
            return {
                gameId: fallbackGameId,
                resolvedGameType: gameType,
            };
        }
    }

    return {
        gameId: null,
        resolvedGameType: null,
    };
}

export function getDatesInRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];

    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

export async function fetchRaceData(
    date: string,
    ctx: ToolContext
): Promise<{ ok: true; data: RaceApiRaw } | { ok: false; error: string }> {
    const raceUrl = new URL(`${ctx.baseUrl}/api/race`);
    raceUrl.searchParams.set('view', 'raw');
    raceUrl.searchParams.set('date', date);

    const raceResult = await fetchText(raceUrl, ctx);

    if (!raceResult.ok) {
        return {
            ok: false,
            error: JSON.stringify({
                error: 'Failed to fetch race data',
                status: raceResult.status,
            }),
        };
    }

    try {
        const data = JSON.parse(raceResult.text) as RaceApiRaw;
        return { ok: true, data };
    } catch (error) {
        return {
            ok: false,
            error: JSON.stringify({
                error: 'Could not parse race API response',
                details: String(error),
                date,
            }),
        };
    }
}
