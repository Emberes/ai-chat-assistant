import { findGameIdForRace } from '@/app/api/race/route';
import { isValidISODate } from './dates';
import { isDriverInfoArgs } from './functionMappingGuards';
import { fetchText, findTrackByName, normalize } from './functionMappingHelpers';
import { FunctionMapping, GameAiResponse, RaceApiRaw } from './types';

export const get_driver_info: FunctionMapping = async (args, ctx) => {
    if (!isDriverInfoArgs(args)) {
        return JSON.stringify({
            error: 'Missing or invalid args. Expected { driverName, trackName, date, gameType }',
            got: args,
        });
    }

    const driverName = args.driverName.trim();
    const trackName = args.trackName.trim();
    const date = args.date.trim();
    const gameType = args.gameType.trim();

    if (!driverName || !trackName || !gameType || !isValidISODate(date)) {
        return JSON.stringify({
            error: 'Invalid args for get_driver_info',
            got: { driverName, trackName, date, gameType },
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
        gamesUrl.searchParams.set('view', 'ai');

        const gameResult = await fetchText(gamesUrl, ctx);

        if (!gameResult.ok) {
            continue;
        }

        try {
            const parsed = JSON.parse(gameResult.text) as GameAiResponse;

            const found = (parsed.starts ?? []).some((s) => {
                const fullName = `${s.driver?.firstName ?? ''} ${s.driver?.lastName ?? ''}`.trim();
                const shortName = s.driver?.shortName ?? '';
                const target = normalize(driverName);

                return (
                    normalize(fullName).includes(target) || normalize(shortName).includes(target)
                );
            });

            if (found) {
                return gameResult.text;
            }
        } catch (error) {
            console.warn(`Could not parse /api/games response for race ${raceNumber}:`, error);
            continue;
        }
    }

    return JSON.stringify({
        error: `Could not find driver "${driverName}" on ${trackName} in ${gameType} on ${date}.`,
    });
};
