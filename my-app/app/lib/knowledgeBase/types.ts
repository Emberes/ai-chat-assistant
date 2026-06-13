export type KnowledgeBaseRecord = {
    id: number;
    key: string;
    title: string | null;
    content: string;
    source: string | null;
    embedding: number[];
    embedding_vector: string;
    created_at: Date;
    updated_at: Date;
};

export type KnowledgeBaseSearchMatch = {
    id: number;
    key: string;
    title: string | null;
    content: string;
    source: string | null;
    similarity: number;
};

export type KnowledgeBaseQuestionArgs = {
    question: string;
};

export type KnowledgeGapsArgs = Record<string, never>;
