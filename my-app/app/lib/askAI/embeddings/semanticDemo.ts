import { createEmbedding } from './embeddings';
import { cosineSimilarity } from './compareEmbeddings';
import { SemanticMatch } from './types';
import { faqItems } from './faqData';

export async function findMostSimilarQuestion(query: string): Promise<{
    query: string;
    bestMatch: SemanticMatch;
    allMatches: SemanticMatch[];
}> {
    const queryEmbedding = await createEmbedding(query);

    const allMatches: SemanticMatch[] = [];

    for (const item of faqItems) {
        const textToCompare = `${item.question} ${item.answer}`;
        const candidateEmbedding = await createEmbedding(textToCompare);
        const similarity = cosineSimilarity(queryEmbedding, candidateEmbedding);

        allMatches.push({
            id: item.id,
            text: item.question,
            answer: item.answer,
            similarity,
        });
    }

    allMatches.sort((a, b) => b.similarity - a.similarity);

    return {
        query,
        bestMatch: allMatches[0],
        allMatches,
    };
}
