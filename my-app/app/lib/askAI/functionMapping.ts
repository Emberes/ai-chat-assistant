import { FunctionMapping } from './types';
import {
    get_race_info,
    get_races_by_track_and_date,
    get_races_by_track_and_date_range,
    get_races_date,
    get_races_date_range,
} from './raceHandlers';
import { get_horse_info } from './horseHandlers';
import { get_driver_info } from './driverHandlers';
import { get_faq_question } from '../faq/faqHandler';
import { get_knowledge_base } from '../knowledgeBase/knowledgeBaseHandler';
import { get_knowledge_gaps } from '../knowledgeGaps/knowledgeGapHandler';

export const function_mapping: Record<string, FunctionMapping> = {
    get_races_date,
    get_races_date_range,
    get_races_by_track_and_date,
    get_races_by_track_and_date_range,
    get_race_info,
    get_horse_info,
    get_driver_info,
    get_faq_question,
    get_knowledge_base,
    get_knowledge_gaps,
};
