export type TrackInfo = {
    id: number;
    name: string;
    startTime: string;
    biggestGameType?: string | null;
    sport?: string | null;
    countryCode?: string | null;
    races: Array<{
        id: string;
        number: number;
        status: string;
        startTime: string;
        mergedPools?: Array<{
            name: string;
            betTypes: string[];
        }>;
    }>;
};

export type SearchResult = {
    date: string;
    searchQuery: string;
    tracks: Array<{
        trackId: number;
        trackName: string;
        firstStartTime: string;
        races: Array<{
            number: number;
            startTime: string;
            status: string;
            id: string;
        }>;
    }>;
};
