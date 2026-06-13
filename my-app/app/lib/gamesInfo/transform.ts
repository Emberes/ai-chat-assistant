import { AtgGameResponse } from './types';

export function toAiShape(raw: AtgGameResponse, effectiveId: string, horseFilter?: string) {
    const races = Array.isArray(raw.races) ? raw.races : [];
    const race = races[0];
    const starts = Array.isArray(race?.starts) ? race.starts : [];

    const filtered = horseFilter
        ? starts.filter((s) =>
              (s.horse?.name ?? '').toLowerCase().includes(horseFilter.toLowerCase())
          )
        : starts;

    return {
        id: effectiveId,
        race: race
            ? {
                  id: race.id,
                  number: race.number,
                  name: race.name,
                  date: race.date,
                  startTime: race.startTime,
                  track: race.track?.name ?? null,
                  distance: race.distance ?? null,
              }
            : null,
        starts: filtered.map((s) => ({
            raceDate: race?.date ?? null,
            number: s.number ?? null,
            postPosition: s.postPosition ?? null,
            horse: {
                id: s.horse?.id ?? null,
                name: s.horse?.name ?? null,
                age: s.horse?.age ?? null,
                sex: s.horse?.sex ?? null,
            },
            trainer: s.horse?.trainer
                ? {
                      firstName: s.horse.trainer.firstName ?? null,
                      lastName: s.horse.trainer.lastName ?? null,
                      shortName: s.horse.trainer.shortName ?? null,
                  }
                : null,
            driver: s.driver
                ? {
                      firstName: s.driver.firstName ?? null,
                      lastName: s.driver.lastName ?? null,
                      shortName: s.driver.shortName ?? null,
                  }
                : null,
        })),
        matchCount: filtered.length,
    };
}
