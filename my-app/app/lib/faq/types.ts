export type FaqRecord = {
    id: number;
    question: string;
    answer: string;
    embedding: number[];
    embedding_vector: number[] | string;
    created_at: string;
    updated_at: string;
};

export type FaqQuestionArgs = {
    question: string;
};

export type FaqSearchMatch = {
    id: number;
    question: string;
    answer: string;
    similarity: number;
};
