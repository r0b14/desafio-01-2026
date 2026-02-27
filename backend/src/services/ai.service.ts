import { openai } from "../config/openai";
import type { AIAnalysisResult } from "../types";

export const analyzeMessage = async (
  content: string,
): Promise<AIAnalysisResult | null> => {
  try {
    // Chamada formatada para Structured Outputs (JSON Mode)
    // prompt: identificar emoção, intenções e deltas de skills baseados no histórico
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente analisador de perfil comportamental...",
        },
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return result as AIAnalysisResult;
  } catch (error) {
    console.error("Error analyzing message:", error);
    return null;
  }
};
