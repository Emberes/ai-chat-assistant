import { readFile } from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { BenchmarkQuestionRow, CsvRow } from './type';

export async function readBenchmarkQuestions(): Promise<BenchmarkQuestionRow[]> {
    const filePath = path.join(process.cwd(), 'app', 'data', 'benchmark-questions.csv');

    const fileContent = await readFile(filePath, 'utf-8');

    console.log('CSV raw preview:', fileContent.slice(0, 300));

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
    }) as CsvRow[];

    console.log('Parsed CSV records count:', records.length);
    console.log('First parsed record:', records[0]);

    return records.map((row) => ({
        game: row.Game,
        category: row.Category,
        questionSv: row['Question (SV)'],
        answerType: row['Answer type'],
    }));
}
