export type GameArgs = {
    id?: string;
    game: string;
    date: string;
    trackId: string;
    raceNumber: string;
    horse?: string;
    view?: 'ai' | 'raw';
};
export type ViewMode = 'ai' | 'raw';

export type GameByIdArgs = {
    id: string;
    horse?: string;
    view?: ViewMode;
};

export type GameByPartsArgs = {
    game: string;
    date: string;
    trackId: string;
    raceNumber: string;
    horse?: string;
    view?: ViewMode;
};

export type GamesQuery = Partial<GameArgs> & {
    id?: string;
};

export type ResolvedGameQuery =
    | { mode: 'id'; id: string; view?: 'ai' | 'raw'; horse?: string }
    | {
          mode: 'parts';
          game: string;
          date: string;
          trackId: string;
          raceNumber: string;
          view?: 'ai' | 'raw';
          horse?: string;
      };

export type AtgGameResponse = {
    id?: string;
    date?: string;
    races?: Array<{
        id?: string;
        date?: string;
        number?: number;
        name?: string;
        startTime?: string;
        distance?: number;

        track?: {
            id?: string;
            name?: string;
        };
        starts?: Array<{
            id?: string;
            number?: number;
            postPosition?: number;
            distance?: number;

            horse?: {
                id?: number;
                name?: string;
                age?: number;
                sex?: string;
                record?: unknown;
                trainer?: {
                    id?: number;
                    firstName?: string;
                    lastName?: string;
                    shortName?: string;
                };
            };
            driver?: {
                id?: number;
                firstName?: string;
                lastName?: string;
                shortName?: string;
            };
        }>;
    }>;
};
