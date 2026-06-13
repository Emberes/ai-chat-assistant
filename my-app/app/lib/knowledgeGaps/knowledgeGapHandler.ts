import type { FunctionMapping } from '@/app/lib/askAI/types';
import { getOpenKnowledgeGaps } from './knowledgeGapRepository';

export const get_knowledge_gaps: FunctionMapping = async () => {
    try {
        const gaps = await getOpenKnowledgeGaps(20);

        console.log('Knowledge gaps result:', {
            count: gaps.length,
            gaps: gaps.map((gap) => ({
                id: gap.id,
                userQuestion: gap.user_question,
                sourceAttempted: gap.source_attempted,
                reason: gap.reason,
                bestSimilarity: gap.best_similarity,
                status: gap.status,
                createdAt: gap.created_at,
            })),
        });

        return JSON.stringify({
            knowledgeGapCount: gaps.length,
            gaps: gaps.map((gap) => ({
                id: gap.id,
                userQuestion: gap.user_question,
                sourceAttempted: gap.source_attempted,
                reason: gap.reason,
                bestSimilarity: gap.best_similarity,
                status: gap.status,
                createdAt: gap.created_at,
            })),
        });
    } catch (error) {
        console.error('Get knowledge gaps error:', error);

        return JSON.stringify({
            error: 'Failed to get knowledge gaps.',
            details: String(error),
        });
    }
};
