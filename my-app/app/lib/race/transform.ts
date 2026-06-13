import { TrackInfo } from './type';

export function extractRaceSchedule(raw: unknown): {
    date: string;
    tracks: TrackInfo[];
} {
    const r = raw as {
        date?: string;
        tracks?: TrackInfo[];
        data?: { date?: string; tracks?: TrackInfo[] };
    };

    const date = r.data?.date ?? r.date ?? '';
    const tracks = r.data?.tracks ?? r.tracks ?? [];
    return { date, tracks };
}
