export type KnowledgeGapRecord = {
    id: number;
    user_question: string;
    source_attempted: string;
    reason: string | null;
    best_similarity: number | null;
    status: string;
    created_at: Date;
    updated_at: Date;
};

export type CreateKnowledgeGapInput = {
    userQuestion: string;
    sourceAttempted: string;
    reason?: string | null;
    bestSimilarity?: number | null;
};
