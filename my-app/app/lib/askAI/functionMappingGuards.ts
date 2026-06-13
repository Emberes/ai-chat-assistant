import { ToolArgs } from './types';

export function isRaceDateArgs(a: ToolArgs): a is { date: string } {
    return 'date' in a && typeof a.date === 'string';
}

export function isRacesDateRangeArgs(a: ToolArgs): a is { startDate: string; endDate: string } {
    return (
        'startDate' in a &&
        typeof a.startDate === 'string' &&
        'endDate' in a &&
        typeof a.endDate === 'string'
    );
}

export function isRacesByTrackAndDateArgs(a: ToolArgs): a is { date: string; trackName: string } {
    return (
        'date' in a &&
        typeof a.date === 'string' &&
        'trackName' in a &&
        typeof a.trackName === 'string'
    );
}

export function isRacesByTrackAndDateRangeArgs(
    a: ToolArgs
): a is { startDate: string; endDate: string; trackName: string } {
    return (
        'startDate' in a &&
        typeof a.startDate === 'string' &&
        'endDate' in a &&
        typeof a.endDate === 'string' &&
        'trackName' in a &&
        typeof a.trackName === 'string'
    );
}

export function isHorseInfoArgs(
    a: ToolArgs
): a is { horseName: string; trackName: string; date: string; gameType: string } {
    return (
        'horseName' in a &&
        typeof a.horseName === 'string' &&
        'trackName' in a &&
        typeof a.trackName === 'string' &&
        'date' in a &&
        typeof a.date === 'string' &&
        'gameType' in a &&
        typeof a.gameType === 'string'
    );
}

export function isRaceInfoArgs(
    a: ToolArgs
): a is { leg: number; trackName: string; date: string; gameType: string } {
    return (
        'leg' in a &&
        typeof a.leg === 'number' &&
        'trackName' in a &&
        typeof a.trackName === 'string' &&
        'date' in a &&
        typeof a.date === 'string' &&
        'gameType' in a &&
        typeof a.gameType === 'string'
    );
}

export function isDriverInfoArgs(
    a: ToolArgs
): a is { driverName: string; trackName: string; date: string; gameType: string } {
    return (
        'driverName' in a &&
        typeof a.driverName === 'string' &&
        'trackName' in a &&
        typeof a.trackName === 'string' &&
        'date' in a &&
        typeof a.date === 'string' &&
        'gameType' in a &&
        typeof a.gameType === 'string'
    );
}

export function isFaqQuestionArgs(a: ToolArgs): a is { question: string } {
    return 'question' in a && typeof a.question === 'string';
}
