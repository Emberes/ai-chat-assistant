import { google } from 'googleapis';
import LangfuseTrace from 'langfuse';
import LangfuseSpan from 'langfuse';
import path from 'path';

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'app/google/google-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    credentials: {
        client_email: 'sheets@trav-sheets.iam.gserviceaccount.com',
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

/**
 * Funktion för att logga frågor och svar till Google Sheet
 * @param question Användarens fråga till chatten
 * @param answer Svaret som din OpenAI-modell genererade
 */
export async function saveChatToGoogleSheet(
    question: string,
    answer: string,
    langfuseParent?: LangfuseTrace | LangfuseSpan
) {
    const langfuseSpan = langfuseParent
        ? langfuseParent.span({
              name: 'Google Sheets Log',
              input: { question, range: 'Blad1!A:C' },
          })
        : null;
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Blad1!A:C', // Skriver till kolumn A, B och C på fliken "Blad1"
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[question, answer, new Date().toLocaleString('sv-SE')]],
            },
        });
        console.log('Loggningen till Google Sheet lyckades!');
        if (langfuseSpan) {
            langfuseSpan.end({
                output: { status: 'success', message: 'Successfully appended to sheet' },
            });
        }
    } catch (error) {
        console.error('Kunde inte skriva till Google Sheet:', error);

        if (langfuseSpan) {
            let errorMessage = 'Unknown error writing to Google Sheets';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            langfuseSpan.end({
                level: 'ERROR',
                statusMessage: errorMessage,
                output: { error: error instanceof Error ? error.message : String(error) },
            });
        }
    }
}
