import type { BenchmarkQuestion } from './types';

export const benchmarkQuestions: BenchmarkQuestion[] = [
    {
        id: 'harry-boy-basic',
        question: 'Vad är Harry Boy?',
        referenceAnswer:
            'Harry Boy är en snabbspelsfunktion där systemet automatiskt väljer hästar åt spelaren och skapar en färdig kupong.',
        expectedTool: 'get_faq_question',
    },
    {
        id: 'v64-basic',
        question: 'Vad betyder V64?',
        referenceAnswer:
            'V64 är ett poolspel inom trav där spelaren försöker hitta vinnarna i sex utvalda lopp.',
        expectedTool: 'get_faq_question',
    },
    {
        id: 'v85-basic',
        question: 'Vad betyder V85?',
        referenceAnswer: 'V85 är ett travspel där målet är att hitta vinnarna i åtta lopp.',
        expectedTool: 'get_faq_question',
    },
    {
        id: 'harry-boy-v85-difference',
        question: 'Vad är skillnaden mellan Harry Boy och V85?',
        referenceAnswer:
            'Harry Boy är en snabbspelsfunktion som skapar en kupong automatiskt, medan V85 är en spelform där målet är att hitta vinnarna i åtta lopp. Man kan använda Harry Boy för att spela på V85.',
        expectedTool: 'get_knowledge_base',
    },
    {
        id: 'v64-v85-difference',
        question: 'Vad är skillnaden mellan V64 och V85?',
        referenceAnswer:
            'V64 består av sex lopp medan V85 består av åtta lopp. Båda är poolspel där spelaren försöker hitta vinnarna i de utvalda loppen.',
        expectedTool: 'get_knowledge_base',
    },
    {
        id: 'demo-fail-wrong-reference',
        question: 'Vad är Harry Boy?',
        referenceAnswer: 'En katt är ett vanligt husdjur som ofta sover mycket och jagar smådjur.',
        expectedTool: 'get_faq_question',
    },
];
