import { ResolvedGameQuery } from './types';

export function buildGameId(q: Extract<ResolvedGameQuery, { mode: 'parts' }>) {
    return `${q.game}_${q.date}_${q.trackId}_${q.raceNumber}`;
}

export function buildGamesUrl(base: string, q: ResolvedGameQuery): string {
    const baseUrl = new URL(base.replace(/\/$/, ''));

    const id = q.mode === 'id' ? q.id : buildGameId(q);
    baseUrl.pathname = baseUrl.pathname.replace(/\/$/, '') + `/${id}`;

    return baseUrl.toString();
}
