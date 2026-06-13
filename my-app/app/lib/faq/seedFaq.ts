import { faqItems } from './faqData';
import { createFaqEmbedding } from './faqEmbeddings';
import { createFaq } from './faqRepository';

export async function seedFaqs() {
    for (const item of faqItems) {
        const embedding = await createFaqEmbedding(item.question);
        await createFaq(item.question, item.answer, embedding);
    }
}
