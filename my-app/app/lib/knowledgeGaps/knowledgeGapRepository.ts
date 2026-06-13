import { pool } from '@/app/lib/faq/db';
import type { CreateKnowledgeGapInput, KnowledgeGapRecord } from './types';

export async function createKnowledgeGap(
    input: CreateKnowledgeGapInput
): Promise<KnowledgeGapRecord> {
    const result = await pool.query(
        `
        INSERT INTO knowledge_gaps (
            user_question,
            source_attempted,
            reason,
            best_similarity
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            input.userQuestion,
            input.sourceAttempted,
            input.reason ?? null,
            input.bestSimilarity ?? null,
        ]
    );

    return result.rows[0];
}

export async function getOpenKnowledgeGaps(limit = 20): Promise<KnowledgeGapRecord[]> {
    const result = await pool.query(
        `
        SELECT *
        FROM knowledge_gaps
        WHERE status = 'open'
        ORDER BY created_at DESC
        LIMIT $1
        `,
        [limit]
    );

    return result.rows;
}
