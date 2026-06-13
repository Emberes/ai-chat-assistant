export type SemanticCandidate = {
    id: string;
    text: string;
};

export type SemanticMatch = {
    id: string;
    text: string;
    answer: string;
    similarity: number;
};
