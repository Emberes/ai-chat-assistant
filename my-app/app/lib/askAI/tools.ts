import type OpenAI from 'openai';
import { faqFunctionSchema } from '@/app/lib/faq/functionSchema';
import { knowledgeBaseFunctionSchema } from '../knowledgeBase/functionSchema';
import { knowledgeGapsFunctionSchema } from '../knowledgeGaps/functionSchema';

export const tools = [
    {
        type: 'function',
        name: 'get_races_date',
        description:
            'Use this to find all races on one specific date across all tracks. Use it when the user asks about one date only and is not asking about one specific track.',
        strict: true,
        parameters: {
            type: 'object',
            properties: {
                date: {
                    type: 'string',
                    description: "Date in format YYYY-MM-DD ('2024-01-01')",
                },
            },
            required: ['date'],
            additionalProperties: false,
        },
    },
    {
        type: 'function',
        name: 'get_races_date_range',
        description:
            'Use this to find all races across multiple dates and across all tracks. Use it for questions like this weekend, next week, or between two dates when the user is not asking about one specific track. Do not use this for one specific track.',
        strict: true,
        parameters: {
            type: 'object',
            properties: {
                startDate: {
                    type: 'string',
                    description: "Start date in YYYY-MM-DD format, for example '2024-01-01'.",
                },
                endDate: {
                    type: 'string',
                    description: "End date in YYYY-MM-DD format, for example '2024-01-07'.",
                },
            },
            required: ['startDate', 'endDate'],
            additionalProperties: false,
        },
    },
    {
        type: 'function',
        name: 'get_races_by_track_and_date',
        description:
            'Use this only for one specific track on one specific date. Do not use this for weekends, next week, or other date ranges if get_races_by_track_and_date_range already applies.',
        strict: true,
        parameters: {
            type: 'object',
            properties: {
                date: {
                    type: 'string',
                    description:
                        "The date in YYYY-MM-DD format. If the user asks for 'the weekend', use the date for the upcoming Saturday.",
                },
                trackName: {
                    type: 'string',
                    description: "Name of the track, for example 'Solvalla' or 'Åby'.",
                },
            },
            required: ['date', 'trackName'],
            additionalProperties: false,
        },
    },
    {
        type: 'function',
        name: 'get_races_by_track_and_date_range',
        description:
            'Use this when the user asks about one specific track across multiple dates, for example next week, this weekend, or between two dates. This tool is normally sufficient on its own for answering the question. Do not call get_races_by_track_and_date for each day in the range unless the user explicitly asks for extra day-by-day detail that is missing from this tool.',
        strict: true,
        parameters: {
            type: 'object',
            properties: {
                trackName: {
                    type: 'string',
                    description: "Name of the track, for example 'Solvalla' or 'Åby'.",
                },
                startDate: {
                    type: 'string',
                    description:
                        "Start date in YYYY-MM-DD format. For 'next week', use the Monday of next week.",
                },
                endDate: {
                    type: 'string',
                    description:
                        "End date in YYYY-MM-DD format. For 'next week', use the Sunday of next week.",
                },
            },
            required: ['trackName', 'startDate', 'endDate'],
            additionalProperties: false,
        },
    },
    {
        type: 'function',
        name: 'get_horse_info',
        description:
            'Fetch detailed info about a specific horse. This is a helper function that can be used after fetching a game to get more details about a specific horse if the user asks for it.',
        strict: true,
        parameters: {
            type: 'object',
            properties: {
                horseName: { type: 'string', description: 'Name of the horse' },
                trackName: {
                    type: 'string',
                    description: "Name of the track, for example 'Solvalla' or 'Åby'.",
                },
                date: { type: 'string', description: 'YYYY-MM-DD' },
                gameType: {
                    type: 'string',
                    description: 'Main game type, for example V64, V3, V85, or V86.',
                },
            },
            required: ['horseName', 'trackName', 'date', 'gameType'],
            additionalProperties: false,
        },
    },
    {
        type: 'function',
        name: 'get_race_info',
        description:
            'Fetch information about a specific race for a specific track, date, main game type, and leg number.',
        strict: true,
        parameters: {
            type: 'object',
            properties: {
                leg: {
                    type: 'integer',
                    description: 'Leg number in the game, for example 1 for V75-1.',
                },
                trackName: {
                    type: 'string',
                    description: "Name of the track, for example 'Solvalla' or 'Åby'.",
                },
                date: { type: 'string', description: 'YYYY-MM-DD' },
                gameType: {
                    type: 'string',
                    description: 'Main game type, for example V64, V3, V85, or V86.',
                },
            },
            required: ['leg', 'trackName', 'date', 'gameType'],
            additionalProperties: false,
        },
    },
    {
        type: 'function',
        name: 'get_driver_info',
        description:
            'Fetch information about a specific driver for a specific track, date, and main game type.',
        strict: true,
        parameters: {
            type: 'object',
            properties: {
                driverName: { type: 'string', description: 'Name of the driver' },
                trackName: {
                    type: 'string',
                    description: "Name of the track, for example 'Solvalla' or 'Åby'.",
                },
                date: { type: 'string', description: 'YYYY-MM-DD' },
                gameType: {
                    type: 'string',
                    description: 'Main game type, for example V64, V3, V85, or V86.',
                },
            },
            required: ['driverName', 'trackName', 'date', 'gameType'],
            additionalProperties: false,
        },
    },
    faqFunctionSchema,
    knowledgeBaseFunctionSchema,
    knowledgeGapsFunctionSchema,
] satisfies OpenAI.Responses.Tool[];
