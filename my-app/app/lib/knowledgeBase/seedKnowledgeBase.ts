import { knowledgeBaseItems } from './knowledgeBaseData';
import { createKnowledgeBaseEmbedding } from './knowledgeBaseEmbeddings';
import { createKnowledgeBaseItem } from './knowledgeBaseRepository';

export async function seedKnowledgeBase() {
    for (const item of knowledgeBaseItems) {
        const textForEmbedding = `${item.title}\n${item.content}`;

        const embedding = await createKnowledgeBaseEmbedding(textForEmbedding);

        await createKnowledgeBaseItem(item.key, item.title, item.content, item.source, embedding);
    }
}
