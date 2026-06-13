import { LangfuseClient } from "@langfuse/client";

const langfuse = new LangfuseClient();

const PROMPT_NAMES = {
  askAiSystem: "atg-askai-system",
  askAiFinal: "atg-askai-final",
} as const;

const PROMPT_LABEL = process.env.LANGFUSE_PROMPT_LABEL ?? "production";

export async function getSystemPromptFromLangfuse(
  todaysDate: string,
): Promise<string> {
  try {
    const prompt = await langfuse.prompt.get(PROMPT_NAMES.askAiSystem, {
      type: "text",
      label: PROMPT_LABEL,
    });

    return prompt.compile({ todaysDate });
  } catch (error) {
    console.error("Error fetching system prompt from Langfuse:", error);
    throw error;
  }
}

export async function getFinalSystemPromptFromLangfuse(): Promise<string> {
  const prompt = await langfuse.prompt.get(PROMPT_NAMES.askAiFinal, {
    type: "text",
  });
  return prompt.compile({});
}
