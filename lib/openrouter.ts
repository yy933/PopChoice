import { openai } from "@/lib/openrouter-client"; 
import {
  MOVIE_RECOMMENDER_SYSTEM_INSTRUCTION,
  buildMoviePrompt,
} from "@/lib/prompts";
import type { LLMReasonParams, LLMReasonResponse } from "@/types";

export async function generateReasonWithOpenRouter({
  userInput,
  movie,
  isLowMatch,
}: LLMReasonParams): Promise<LLMReasonResponse> {
  const prompt = buildMoviePrompt({ userInput, movie, isLowMatch });

  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MOVIE_RECOMMENDER_SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const parsed = JSON.parse(completion.choices[0].message.content || "{}");

    return {
      isRelevant: Boolean(parsed.isRelevant),
      reason:
        parsed.reason ||
        `This movie 《${movie.title}》 (${movie.release_year}) is highly recommended for you!`,
    };
  } catch (error: any) {
    console.warn("OpenRouter API Error:", error.message);
    return {
      isRelevant: true,
      reason: `This movie 《${movie.title}》 (${movie.release_year}) is perfect for you!`,
    };
  }
}
