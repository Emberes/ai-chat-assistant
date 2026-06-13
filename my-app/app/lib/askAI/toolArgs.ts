import type { BuildToolArgsResult } from './types';
import { parseISODate } from './dates';

function getMissingFields(fields: Record<string, string | number>): string[] {
    return Object.entries(fields)
        .filter(([, value]) => value === '' || Number.isNaN(value))
        .map(([key]) => key);
}

export function buildFixedToolArgs(
    toolName: string,
    raw: Record<string, unknown>,
    todaysDate: string
): BuildToolArgsResult {
    switch (toolName) {
        case 'get_races_date': {
            const date = typeof raw.date === 'string' ? parseISODate(raw.date) : todaysDate;
            return { ok: true, fixedArgs: { date } };
        }

        case 'get_races_date_range': {
            const startDate = typeof raw.startDate === 'string' ? parseISODate(raw.startDate) : '';
            const endDate = typeof raw.endDate === 'string' ? parseISODate(raw.endDate) : '';

            const missing = getMissingFields({ startDate, endDate });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { startDate, endDate } };
        }

        case 'get_races_by_track_and_date': {
            const date = typeof raw.date === 'string' ? parseISODate(raw.date) : todaysDate;
            const trackName = typeof raw.trackName === 'string' ? raw.trackName.trim() : '';

            const missing = getMissingFields({ trackName });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { date, trackName } };
        }

        case 'get_races_by_track_and_date_range': {
            const startDate = typeof raw.startDate === 'string' ? parseISODate(raw.startDate) : '';
            const endDate = typeof raw.endDate === 'string' ? parseISODate(raw.endDate) : '';
            const trackName = typeof raw.trackName === 'string' ? raw.trackName.trim() : '';

            const missing = getMissingFields({ startDate, endDate, trackName });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { startDate, endDate, trackName } };
        }

        case 'get_horse_info': {
            const horseName = typeof raw.horseName === 'string' ? raw.horseName.trim() : '';
            const trackName = typeof raw.trackName === 'string' ? raw.trackName.trim() : '';
            const gameType = typeof raw.gameType === 'string' ? raw.gameType.trim() : '';
            const date = typeof raw.date === 'string' ? parseISODate(raw.date) : '';

            const missing = getMissingFields({ horseName, trackName, gameType, date });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { horseName, trackName, date, gameType } };
        }

        case 'get_race_info': {
            const leg = typeof raw.leg === 'number' ? raw.leg : Number(raw.leg);
            const trackName = typeof raw.trackName === 'string' ? raw.trackName.trim() : '';
            const gameType = typeof raw.gameType === 'string' ? raw.gameType.trim() : '';
            const date = typeof raw.date === 'string' ? parseISODate(raw.date) : '';

            const missing = getMissingFields({ leg, trackName, gameType, date });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { leg, trackName, date, gameType } };
        }

        case 'get_driver_info': {
            const driverName = typeof raw.driverName === 'string' ? raw.driverName.trim() : '';
            const trackName = typeof raw.trackName === 'string' ? raw.trackName.trim() : '';
            const gameType = typeof raw.gameType === 'string' ? raw.gameType.trim() : '';
            const date = typeof raw.date === 'string' ? parseISODate(raw.date) : '';

            const missing = getMissingFields({ driverName, trackName, gameType, date });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { driverName, trackName, date, gameType } };
        }
        case 'get_faq_question': {
            const question = typeof raw.question === 'string' ? raw.question.trim() : '';

            const missing = getMissingFields({ question });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { question } };
        }
        case 'get_knowledge_base': {
            const question = typeof raw.question === 'string' ? raw.question.trim() : '';

            const missing = getMissingFields({ question });
            if (missing.length > 0) return { ok: false, missing };

            return { ok: true, fixedArgs: { question } };
        }
        case 'get_knowledge_gaps': {
            return { ok: true, fixedArgs: {} };
        }
        default:
            return { ok: false, error: `Unsupported tool: ${toolName}` };
    }
}
