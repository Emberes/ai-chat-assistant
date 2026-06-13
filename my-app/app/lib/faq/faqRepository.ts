import { pool } from './db';
import type { FaqRecord, FaqSearchMatch } from './types';
import { toPgVector } from './vectorHelpers';

export async function getAllFaqs(): Promise<FaqRecord[]> {
    const result = await pool.query('SELECT * FROM faq ORDER BY id ASC');

    return result.rows.map((row) => ({
        ...row,
        embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding,
        embedding_vector:
            typeof row.embedding_vector === 'string' ? row.embedding_vector : row.embedding_vector,
    }));
}

export async function createFaq(
    question: string,
    answer: string,
    embedding: number[]
): Promise<FaqRecord> {
    const result = await pool.query(
        `
        INSERT INTO faq (question, answer, embedding, embedding_vector)
        VALUES ($1, $2, $3::jsonb, $4::vector)
        ON CONFLICT (question)
        DO UPDATE SET
            answer = EXCLUDED.answer,
            embedding = EXCLUDED.embedding,
            embedding_vector = EXCLUDED.embedding_vector,
            updated_at = NOW()
        RETURNING *
        `,
        [question, answer, JSON.stringify(embedding), toPgVector(embedding)]
    );

    const row = result.rows[0];

    return {
        ...row,
        embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding,
        embedding_vector:
            typeof row.embedding_vector === 'string' ? row.embedding_vector : row.embedding_vector,
    };
}

export async function searchFaqsByEmbedding(
    embedding: number[],
    threshold = 0.7,
    limit = 5
): Promise<FaqSearchMatch[]> {
    const vector = toPgVector(embedding);

    // console.log('Searching FAQ in database:', {
    //     threshold,
    //     limit,
    //     embeddingLength: embedding.length,
    //     vectorPreview: vector.slice(0, 80),
    // });

    const result = await pool.query(
        `
        SELECT
            id,
            question,
            answer,
            1 - (embedding_vector <=> $1::vector) AS similarity
        FROM faq
        WHERE 1 - (embedding_vector <=> $1::vector) >= $2
        ORDER BY embedding_vector <=> $1::vector
        LIMIT $3
        `,
        [vector, threshold, limit]
    );

    console.log(
        'Raw FAQ DB result:',
        result.rows.map((row) => ({
            id: row.id,
            question: row.question,
            answer: row.answer,
            similarity: Number(row.similarity),
        }))
    );

    return result.rows.map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        similarity: Number(row.similarity),
    }));
}
