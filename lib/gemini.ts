import { ai } from "@/lib/gemini-client"; 
import { Type } from "@google/genai";
import {
  MOVIE_RECOMMENDER_SYSTEM_INSTRUCTION,
  buildMoviePrompt,
} from "@/lib/prompts";
import type { LLMReasonParams, LLMReasonResponse } from "@/types";

export async function generateReasonWithGemini({
  userInput,
  movie,
  isLowMatch,
}: LLMReasonParams): Promise<LLMReasonResponse> {
  const prompt = buildMoviePrompt({ userInput, movie, isLowMatch });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: MOVIE_RECOMMENDER_SYSTEM_INSTRUCTION,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRelevant: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["isRelevant", "reason"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    return {
      isRelevant: Boolean(parsed.isRelevant),
      reason:
        parsed.reason ||
        `This movie 《${movie.title}》 (${movie.release_year}) is highly recommended for you!`,
    };
  } catch (error: any) {
    console.warn("Gemini API Error:", error.message);
    return {
      isRelevant: true,
      reason: `This movie 《${movie.title}》 (${movie.release_year}) is perfect for you!`,
    };
  }
}
