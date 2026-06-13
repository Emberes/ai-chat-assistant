import type { FunctionMapping } from '@/app/lib/askAI/types';
import { isFaqQuestionArgs } from '@/app/lib/askAI/functionMappingGuards';
import { createFaqEmbedding } from './faqEmbeddings';
import { searchFaqsByEmbedding } from './faqRepository';

// lägg till så att när den inte får någon match så ska det loggas som "knowledge gap" som ska kunna ge lite mer insikt i vad som saknas i FAQ:n //

export const get_faq_question: FunctionMapping = async (args) => {
    try {
        if (!isFaqQuestionArgs(args)) {
            return JSON.stringify({
                error: 'Missing or invalid args. Expected { question: string }',
                got: args,
            });
        }

        const question = args.question.trim();

        if (!question) {
            return JSON.stringify({
                error: 'Question is required.',
            });
        }

        const FAQ_SIMILARITY_THRESHOLD = 0.7;
        const FAQ_MATCH_LIMIT = 5;
        const queryEmbedding = await createFaqEmbedding(question);
        const matches = await searchFaqsByEmbedding(
            queryEmbedding,
            FAQ_SIMILARITY_THRESHOLD,
            FAQ_MATCH_LIMIT
        );

        console.log('FAQ search result:', {
            userQuestion: question,
            matchCount: matches.length,
            bestMatch: matches[0]
                ? {
                      question: matches[0].question,
                      answer: matches[0].answer,
                      similarity: matches[0].similarity,
                  }
                : null,
        });

        if (matches.length === 0) {
            return JSON.stringify({
                userQuestion: question,
                faqFound: false,
                bestMatch: null,
                reason: 'No FAQ match above threshold.',
            });
        }
        return JSON.stringify({
            userQuestion: question,
            faqFound: true,
            matchedFaqQuestion: matches[0].question,
            faqAnswer: matches[0].answer,
            similarity: matches[0].similarity,
            allMatches: matches,
        });
    } catch (error) {
        console.error('FAQ handler error:', error);

        return JSON.stringify({
            error: 'Failed to search FAQ.',
            details: String(error),
        });
    }
};
