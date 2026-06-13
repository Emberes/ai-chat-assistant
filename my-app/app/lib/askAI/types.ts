import { FaqQuestionArgs } from '../faq/types';
import { KnowledgeBaseQuestionArgs, KnowledgeGapsArgs } from '../knowledgeBase/types';

export type ChatHistoryMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export type Body = {
    question?: string;
    previousResponseId?: string;
    sessionId?: string;
    messages?: ChatHistoryMessage[];
};

export type AskAIResponse = {
    answer: string;
    sessionId: string;
    responseId: string;
};

export type RaceDateArgs = { date: string };
export type RacesDateRangeArgs = {
    startDate: string;
    endDate: string;
};
export type RacesByTrackAndDateArgs = { date: string; trackName: string };
export type RacesByTrackAndDateRangeArgs = {
    startDate: string;
    endDate: string;
    trackName: string;
};

export type HorseInfoArgs = {
    horseName: string;
    trackName: string;
    date: string;
    gameType: string;
};

export type RaceInfoArgs = {
    leg: number;
    trackName: string;
    date: string;
    gameType: string;
};

export type DriverInfoArgs = {
    driverName: string;
    trackName: string;
    date: string;
    gameType: string;
};

export type ToolArgs =
    | RaceDateArgs
    | RacesDateRangeArgs
    | RacesByTrackAndDateArgs
    | RacesByTrackAndDateRangeArgs
    | HorseInfoArgs
    | RaceInfoArgs
    | DriverInfoArgs
    | FaqQuestionArgs
    | KnowledgeBaseQuestionArgs
    | KnowledgeGapsArgs;

export type ToolContext = {
    baseUrl: string;
    traceId: string;
    sessionId: string;
};

export type FunctionMapping = (args: ToolArgs, ctx: ToolContext) => Promise<string>;

export type RaceApiRaw = {
    date?: string;
    tracks?: Array<{
        id: number;
        name: string;
        biggestGameType?: string | null;
        sport?: string | null;
        countryCode?: string | null;
        races?: Array<{
            id: string;
            number: number;
            status: string;
            startTime: string;
        }>;
    }>;
};

export type GameAiResponse = {
    id?: string;
    race?: {
        id?: string | null;
        number?: number | null;
        name?: string | null;
        date?: string | null;
        startTime?: string | null;
        track?: string | null;
        distance?: number | null;
    } | null;
    starts?: Array<{
        raceDate?: string | null;
        number?: number | null;
        postPosition?: number | null;
        horse?: {
            id?: number | null;
            name?: string | null;
            age?: number | null;
            sex?: string | null;
        } | null;
        trainer?: {
            firstName?: string | null;
            lastName?: string | null;
            shortName?: string | null;
        } | null;
        driver?: {
            firstName?: string | null;
            lastName?: string | null;
            shortName?: string | null;
        } | null;
    }>;
    matchCount?: number;
};

export type ResponseFunctionCall = {
    type: 'function_call';
    call_id: string;
    name: string;
    arguments: string;
};

export type FunctionCallOutputItem = {
    type: 'function_call_output';
    call_id: string;
    output: string;
};

export type BuildToolArgsResult =
    | { ok: true; fixedArgs: ToolArgs }
    | { ok: false; missing: string[] }
    | { ok: false; error: string };
