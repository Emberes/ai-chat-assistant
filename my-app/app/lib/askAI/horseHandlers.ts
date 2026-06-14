import { findGameIdForRace } from '@/app/lib/race/utils';
import { isValidISODate } from './dates';
import { isHorseInfoArgs } from './functionMappingGuards';
import { fetchText, findTrackByName, normalize } from './functionMappingHelpers';
import { FunctionMapping, GameAiResponse, RaceApiRaw } from './types';

export const get_horse_info: FunctionMapping = async (args, ctx) => {
    if (!isHorseInfoArgs(args)) {
        return JSON.stringify({
            error: 'Missing or invalid args. Expected { horseName, trackName, date, gameType }',
            got: args,
        });
    }

    const horseName = args.horseName.trim();
    const trackName = args.trackName.trim();
    const date = args.date.trim();
    const gameType = args.gameType.trim();

    if (!horseName || !trackName || !gameType || !isValidISODate(date)) {
        return JSON.stringify({
            error: 'Invalid args for get_horse_info',
            got: { horseName, trackName, date, gameType },
        });
    }

    const raceUrl = new URL(`${ctx.baseUrl}/api/race`);
    raceUrl.searchParams.set('view', 'raw');
    raceUrl.searchParams.set('date', date);

    const raceResult = await fetchText(raceUrl, ctx);

    if (!raceResult.ok) {
        return JSON.stringify({
            error: 'Failed to fetch race data',
            status: raceResult.status,
        });
    }

    let raceData: RaceApiRaw & {
        games?: Record<string, { id?: string; races?: string[]; tracks?: number[] }[]>;
    };

    try {
        raceData = JSON.parse(raceResult.text) as RaceApiRaw & {
            games?: Record<string, { id?: string; races?: string[]; tracks?: number[] }[]>;
        };
    } catch (error) {
        return JSON.stringify({
            error: 'Could not parse race API response',
            details: String(error),
        });
    }

    const track = findTrackByName(raceData, trackName);

    if (!track) {
        return JSON.stringify({
            error: `Could not find track "${trackName}" on ${date}.`,
        });
    }

    if (normalize(track.biggestGameType ?? '') !== normalize(gameType)) {
        return JSON.stringify({
            error: `Could not match game type "${gameType}" for track "${trackName}" on ${date}.`,
            availableGameType: track.biggestGameType ?? null,
        });
    }

    const raceNumbers = (track.races ?? []).map((r) => r.number);

    for (const raceNumber of raceNumbers) {
        const gameId = findGameIdForRace(raceData, gameType, track.id, raceNumber, date);

        if (!gameId) {
            continue;
        }

        const gamesUrl = new URL(`${ctx.baseUrl}/api/games`);
        gamesUrl.searchParams.set('id', gameId);
        gamesUrl.searchParams.set('horse', horseName);
        gamesUrl.searchParams.set('view', 'ai');

        const gameResult = await fetchText(gamesUrl, ctx);

        if (!gameResult.ok) {
            continue;
        }

        try {
            const parsed = JSON.parse(gameResult.text) as GameAiResponse;

            if ((parsed.matchCount ?? 0) > 0) {
                return gameResult.text;
            }
        } catch (error) {
            console.warn(`Could not parse /api/games response for race ${raceNumber}:`, error);
            continue;
        }
    }

    return JSON.stringify({
        error: `Could not find horse "${horseName}" on ${trackName} in ${gameType} on ${date}.`,
    });
};
