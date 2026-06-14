export type BenchmarkQuestion = {
    id: string;
    question: string;
    referenceAnswer: string;
    expectedTool?: string;
};

export type EvaluationResult = {
    id: string;
    question: string;
    referenceAnswer: string;
    modelAnswer: string;
    similarity: number;
    passed: boolean;
    expectedTool?: string;
};

export type EvaluationResponse = {
    ok: boolean;
    total?: number;
    passed?: number;
    failed?: number;
    results?: EvaluationResult[];
    error?: string;
};
