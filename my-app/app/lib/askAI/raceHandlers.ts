import { isValidISODate } from './dates';
import type { FunctionMapping } from './types';
import {
    fetchText,
    getDatesInRange,
    normalize,
    findTrackByName,
    fetchRaceData,
    resolveGameIdForRace,
} from './functionMappingHelpers';
import {
    isRaceDateArgs,
    isRaceInfoArgs,
    isRacesByTrackAndDateArgs,
    isRacesByTrackAndDateRangeArgs,
    isRacesDateRangeArgs,
} from './functionMappingGuards';
import { findGameIdForRace } from '@/app/lib/race/utils';

export const get_races_date: FunctionMapping = async (args, ctx) => {
    if (!isRaceDateArgs(args)) {
        return JSON.stringify({
            error: 'Missing or invalid args. Expected { date: string }',
            got: args,
        });
    }

    const date = args.date.trim();

    if (!isValidISODate(date)) {
        return JSON.stringify({
            error: 'Invalid date format. Expected YYYY-MM-DD.',
            got: date,
        });
    }

    const url = new URL(`${ctx.baseUrl}/api/race`);
    url.searchParams.set('view', 'ai');
    url.searchParams.set('date', date);

    const result = await fetchText(url, ctx);

    if (!result.ok) {
        return JSON.stringify({
            error: 'Failed to fetch race data',
            status: result.status,
        });
    }

    return result.text;
};

export const get_races_date_range: FunctionMapping = async (args, ctx) => {
    if (!isRacesDateRangeArgs(args)) {
        return JSON.stringify({
            error: 'Missing or invalid args. Expected { startDate: string, endDate: string }',
            got: args,
        });
    }

    const startDate = args.startDate.trim();
    const endDate = args.endDate.trim();

    if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
        return JSON.stringify({
            error: 'Invalid date format. Expected YYYY-MM-DD for startDate and endDate.',
            got: { startDate, endDate },
        });
    }

    if (startDate > endDate) {
        return JSON.stringify({
            error: 'startDate must be before or equal to endDate.',
            got: { startDate, endDate },
        });
    }

    const dates = getDatesInRange(startDate, endDate);
    const matches: Array<{
        date: string;
        tracks: Array<{
            id: number;
            name: string;
            biggestGameType: string | null;
            sport: string | null;
            countryCode: string | null;
            races: Array<{
                id: string;
                number: number;
                status: string;
                startTime: string;
            }>;
        }>;
    }> = [];

    for (const date of dates) {
        const raceDataResult = await fetchRaceData(date, ctx);

        if (!raceDataResult.ok) {
            continue;
        }

        const parsed = raceDataResult.data;

        matches.push({
            date: parsed.date ?? date,
            tracks: (parsed.tracks ?? []).map((t) => ({
                id: t.id,
                name: t.name,
                biggestGameType: t.biggestGameType ?? null,
                sport: t.sport ?? null,
                countryCode: t.countryCode ?? null,
                races: (t.races ?? []).map((r) => ({
                    id: r.id,
                    number: r.number,
                    status: r.status,
                    startTime: r.startTime,
                })),
            })),
        });
    }

    return JSON.stringify({
        startDate,
        endDate,
        totalDaysChecked: dates.length,
        totalDaysWithData: matches.length,
        hasAnyRaces: matches.some((m) => m.tracks.some((t) => t.races.length > 0)),
        matches,
    });
};

export const get_races_by_track_and_date: FunctionMapping = async (args, ctx) => {
    if (!isRacesByTrackAndDateArgs(args)) {
        return JSON.stringify({
            error: 'Missing or invalid args. Expected { date: string, trackName: string }',
            got: args,
        });
    }

    const date = args.date.trim();
    const trackName = args.trackName.trim();

    if (!isValidISODate(date)) {
        return JSON.stringify({
            error: 'Invalid date format. Expected YYYY-MM-DD.',
            got: date,
        });
    }

    if (!trackName) {
        return JSON.stringify({
            error: 'Missing required arg: trackName',
        });
    }

    const raceDataResult = await fetchRaceData(date, ctx);

    if (!raceDataResult.ok) {
        return raceDataResult.error;
    }

    const parsed = raceDataResult.data;

    const filteredTracks = (parsed.tracks ?? []).filter((t) =>
        normalize(t.name).includes(normalize(trackName))
    );

    return JSON.stringify({
        date: parsed.date ?? date,
        searchQuery: trackName,
        tracks: filteredTracks.map((t) => ({
            trackId: t.id,
            trackName: t.name,
            biggestGameType: t.biggestGameType ?? null,
            sport: t.sport ?? null,
            countryCode: t.countryCode ?? null,
            races: (t.races ?? []).map((r) => ({
                id: r.id,
                number: r.number,
                status: r.status,
                startTime: r.startTime,
            })),
        })),
    });
};

export const get_races_by_track_and_date_range: FunctionMapping = async (args, ctx) => {
    if (!isRacesByTrackAndDateRangeArgs(args)) {
        return JSON.stringify({
            error: 'Missing or invalid args. Expected { startDate: string, endDate: string, trackName: string }',
            got: args,
        });
    }

    const startDate = args.startDate.trim();
    const endDate = args.endDate.trim();
    const trackName = args.trackName.trim();

    if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
        return JSON.stringify({
            error: 'Invalid date format. Expected YYYY-MM-DD for startDate and endDate.',
            got: { startDate, endDate },
        });
    }

    if (!trackName) {
        return JSON.stringify({
            error: 'Missing required arg: trackName',
        });
    }

    if (startDate > endDate) {
        return JSON.stringify({
            error: 'startDate must be before or equal to endDate.',
            got: { startDate, endDate },
        });
    }

    const dates = getDatesInRange(startDate, endDate);
    const matches: Array<{
        date: string;
        trackId: number;
        trackName: string;
        biggestGameType: string | null;
        sport: string | null;
        countryCode: string | null;
        races: Array<{
            id: string;
            number: number;
            status: string;
            startTime: string;
        }>;
    }> = [];

    for (const date of dates) {
        const raceDataResult = await fetchRaceData(date, ctx);

        if (!raceDataResult.ok) {
            continue;
        }

        const parsed = raceDataResult.data;

        const filteredTracks = (parsed.tracks ?? []).filter((t) =>
            normalize(t.name).includes(normalize(trackName))
        );

        for (const t of filteredTracks) {
            matches.push({
                date: parsed.date ?? date,
                trackId: t.id,
                trackName: t.name,
                biggestGameType: t.biggestGameType ?? null,
                sport: t.sport ?? null,
                countryCode: t.countryCode ?? null,
                races: (t.races ?? []).map((r) => ({
                    id: r.id,
                    number: r.number,
                    status: r.status,
                    startTime: r.startTime,
                })),
            });
        }
    }

    return JSON.stringify({
        searchQuery: trackName,
        startDate,
        endDate,
        totalDaysChecked: dates.length,
        totalDaysWithData: matches.length,
        hasAnyRaces: matches.some((m) => m.races.length > 0),
        matches,
    });
};

export const get_race_info: FunctionMapping = async (args, ctx) => {
    if (!isRaceInfoArgs(args)) {
        return JSON.stringify({
            error: 'Missing or invalid args. Expected { leg, trackName, date, gameType }',
            got: args,
        });
    }

    const leg = args.leg;
    const trackName = args.trackName.trim();
    const date = args.date.trim();
    const gameType = args.gameType.trim();

    if (!Number.isFinite(leg) || !trackName || !gameType || !isValidISODate(date)) {
        return JSON.stringify({
            error: 'Invalid args for get_race_info',
            got: { leg, trackName, date, gameType },
        });
    }

    const raceDataResult = await fetchRaceData(date, ctx);

    if (!raceDataResult.ok) {
        return raceDataResult.error;
    }

    const raceData = raceDataResult.data;

    const track = findTrackByName(raceData, trackName);

    if (!track) {
        return JSON.stringify({
            error: `Could not find track "${trackName}" on ${date}.`,
        });
    }

    const raceExists = (track.races ?? []).some((r) => r.number === leg);

    if (!raceExists) {
        return JSON.stringify({
            error: `Could not find leg ${leg} on track "${trackName}" on ${date}.`,
        });
    }
    const { gameId, resolvedGameType } = resolveGameIdForRace(
        raceData as {
            games?: Record<string, { id?: string; races?: string[]; tracks?: number[] }[]>;
        },
        gameType,
        track.id,
        leg,
        date,
        findGameIdForRace
    );

    if (!gameId) {
        return JSON.stringify({
            error: `Could not find game id for ${gameType} on ${date}, track "${trackName}", leg ${leg}.`,
            requestedGameType: gameType,
        });
    }

    console.log('get_race_info: resolved game', {
        requestedGameType: gameType,
        resolvedGameType,
        gameId,
        trackName,
        leg,
        date,
    });

    const gamesUrl = new URL(`${ctx.baseUrl}/api/games`);
    gamesUrl.searchParams.set('id', gameId);
    gamesUrl.searchParams.set('view', 'ai');

    console.log('get_race_info: gamesUrl', gamesUrl.toString());

    const gameResult = await fetchText(gamesUrl, ctx);

    if (!gameResult.ok) {
        return JSON.stringify({
            error: 'Failed to fetch game data',
            status: gameResult.status,
        });
    }

    return gameResult.text;
};
