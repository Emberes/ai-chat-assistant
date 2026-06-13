import { isValidISODate } from '../askAI/dates';
import { GamesQuery, ResolvedGameQuery } from './types';

export function parseGamesQuery(req: Request): GamesQuery {
    const { searchParams } = new URL(req.url);

    const viewRaw = (searchParams.get('view') ?? '').trim();
    const view = viewRaw === 'ai' ? 'ai' : viewRaw === 'raw' ? 'raw' : undefined;

    return {
        id: (searchParams.get('id') ?? '').trim() || undefined,
        game: (searchParams.get('game') ?? '').trim() || undefined,
        date: (searchParams.get('date') ?? '').trim() || undefined,
        trackId: (searchParams.get('trackId') ?? '').trim() || undefined,
        raceNumber: (searchParams.get('raceNumber') ?? '').trim() || undefined,
        horse: (searchParams.get('horse') ?? '').trim() || undefined,
        view,
    };
}

export function resolveGamesQuery(
    q: GamesQuery
): ResolvedGameQuery | { error: string; status: number } {
    const horse = typeof q.horse === 'string' ? q.horse.trim() : undefined;

    if (typeof q.id === 'string' && q.id.trim()) {
        const view = q.view ?? 'raw';
        return { mode: 'id', id: q.id.trim(), view, horse };
    }

    const view = q.view ?? (q.id ? 'raw' : 'ai');

    const game = (q.game ?? '').trim();
    const date = (q.date ?? '').trim();
    const trackId = (q.trackId ?? '').trim();
    const raceNumber = (q.raceNumber ?? '').trim();

    const missing: string[] = [];
    if (!game) missing.push('game');
    if (!date) missing.push('date');
    if (!trackId) missing.push('trackId');
    if (!raceNumber) missing.push('raceNumber');

    if (missing.length > 0) {
        return { error: `Missing required query params: ${missing.join(', ')}`, status: 400 };
    }

    if (!isValidISODate(date)) {
        return { error: 'Invalid date format. Expected YYYY-MM-DD.', status: 400 };
    }

    if (!/^\d+$/.test(trackId)) {
        return { error: 'Invalid trackId. Expected digits only.', status: 400 };
    }

    if (!/^\d+$/.test(raceNumber)) {
        return { error: 'Invalid raceNumber. Expected digits only.', status: 400 };
    }

    return {
        mode: 'parts',
        game,
        date,
        trackId,
        raceNumber,
        view,
        horse,
    };
}
