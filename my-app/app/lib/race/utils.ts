export type CalendarGame = {
    id?: string;
    races?: string[];
    tracks?: number[];
};

export type CalendarDayRaw = {
    games?: Record<string, CalendarGame[]>;
};

export function findGameIdForRace(
    raw: CalendarDayRaw,
    gameType: string,
    trackId: number,
    raceNumber: number,
    date: string
): string | null {
    const gamesForType = raw?.games?.[gameType];

    if (!Array.isArray(gamesForType)) {
        return null;
    }

    const targetRaceId = `${date}_${trackId}_${raceNumber}`;

    for (const game of gamesForType) {
        const races = Array.isArray(game?.races) ? game.races : [];

        if (races.includes(targetRaceId)) {
            return typeof game.id === 'string' ? game.id : null;
        }
    }

    return null;
}
