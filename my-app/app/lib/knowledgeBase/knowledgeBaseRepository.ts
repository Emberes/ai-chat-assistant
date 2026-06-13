import { pool } from '../faq/db';
import type { KnowledgeBaseRecord, KnowledgeBaseSearchMatch } from './types';
import { toPgVector } from '../faq/vectorHelpers';

export async function createKnowledgeBaseItem(
    key: string,
    title: string | null,
    content: string,
    source: string | null,
    embedding: number[]
): Promise<KnowledgeBaseRecord> {
    const result = await pool.query(
        `
        INSERT INTO knowledge_base (key, title, content, source, embedding, embedding_vector)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector)
        ON CONFLICT (key)
        DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            source = EXCLUDED.source,
            embedding = EXCLUDED.embedding,
            embedding_vector = EXCLUDED.embedding_vector,
            updated_at = NOW()
        RETURNING *
        `,
        [key, title, content, source, JSON.stringify(embedding), toPgVector(embedding)]
    );

    const row = result.rows[0];

    return {
        ...row,
        embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding,
        embedding_vector:
            typeof row.embedding_vector === 'string' ? row.embedding_vector : row.embedding_vector,
    };
}

export async function searchKnowledgeBaseByEmbedding(
    embedding: number[],
    threshold = 0.7,
    limit = 5
): Promise<KnowledgeBaseSearchMatch[]> {
    const vector = toPgVector(embedding);

    const result = await pool.query(
        `
        SELECT
            id,
            key,
            title,
            content,
            source,
            1 - (embedding_vector <=> $1::vector) AS similarity
        FROM knowledge_base
        WHERE 1 - (embedding_vector <=> $1::vector) >= $2
        ORDER BY embedding_vector <=> $1::vector
        LIMIT $3
        `,
        [vector, threshold, limit]
    );

    console.log(
        'Raw knowledge base DB result:',
        result.rows.map((row) => ({
            id: row.id,
            key: row.key,
            title: row.title,
            content: row.content,
            source: row.source,
            similarity: Number(row.similarity),
        }))
    );

    return result.rows.map((row) => ({
        id: row.id,
        key: row.key,
        title: row.title,
        content: row.content,
        source: row.source,
        similarity: Number(row.similarity),
    }));
}
