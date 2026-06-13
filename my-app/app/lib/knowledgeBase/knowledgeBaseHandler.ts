import type { FunctionMapping } from '@/app/lib/askAI/types';
import { createKnowledgeBaseEmbedding } from './knowledgeBaseEmbeddings';
import { searchKnowledgeBaseByEmbedding } from './knowledgeBaseRepository';
import { isKnowledgeBaseQuestionArgs } from './functionMappingGuards';
import { createKnowledgeGap } from '../knowledgeGaps/knowledgeGapRepository';

export const get_knowledge_base: FunctionMapping = async (args) => {
    console.log('get_knowledge_base handler started with args:', args);

    try {
        if (!isKnowledgeBaseQuestionArgs(args)) {
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

        const KNOWLEDGE_BASE_SIMILARITY_THRESHOLD = 0.7;
        const KNOWLEDGE_BASE_MATCH_LIMIT = 5;

        const queryEmbedding = await createKnowledgeBaseEmbedding(question);

        const matches = await searchKnowledgeBaseByEmbedding(
            queryEmbedding,
            KNOWLEDGE_BASE_SIMILARITY_THRESHOLD,
            KNOWLEDGE_BASE_MATCH_LIMIT
        );

        console.log('Knowledge base search result:', {
            userQuestion: question,
            matchCount: matches.length,
            bestMatch: matches[0]
                ? {
                      key: matches[0].key,
                      title: matches[0].title,
                      content: matches[0].content,
                      source: matches[0].source,
                      similarity: matches[0].similarity,
                  }
                : null,
            allMatches: matches.map((match) => ({
                key: match.key,
                title: match.title,
                content: match.content,
                source: match.source,
                similarity: match.similarity,
            })),
        });

        if (matches.length === 0) {
            await createKnowledgeGap({
                userQuestion: question,
                sourceAttempted: 'knowledge_base',
                reason: 'No knowledge base match above threshold.',
                bestSimilarity: null,
            });

            return JSON.stringify({
                userQuestion: question,
                knowledgeFound: false,
                bestMatch: null,
                reason: 'No knowledge base match above threshold.',
                knowledgeGapSaved: true,
                answerInstruction:
                    'No verified knowledge base match was found. If you answer from general knowledge, clearly state that the information was not found in the knowledge base.',
            });
        }

        return JSON.stringify({
            userQuestion: question,
            knowledgeFound: true,
            bestMatch: matches[0],
            allMatches: matches,
        });
    } catch (error) {
        console.error('Knowledge base handler error:', error);

        return JSON.stringify({
            error: 'Failed to search knowledge base.',
            details: String(error),
        });
    }
};
