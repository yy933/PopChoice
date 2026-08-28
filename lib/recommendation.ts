import { supabase } from "@/lib/supabase";
import { ai } from "@/lib/gemini";
import type { MatchedMovie } from "@/types";
import { Type } from "@google/genai";
import {
  MOVIE_RECOMMENDER_SYSTEM_INSTRUCTION,
  buildMoviePrompt,
} from "@/lib/prompts";

export const LOW_MATCH_THRESHOLD = 0.35;

export async function vectorSearch(
  embedding: number[],
): Promise<MatchedMovie[]> {
  const { data: matchedMovies, error: rpcError } = await supabase.rpc(
    "match_movies",
    {
      query_embedding: embedding,
      match_threshold: 0.0,
      match_count: 3,
    },
  );

  if (rpcError) {
    console.error("Supabase RPC Error:", rpcError);
    throw new Error("Failed to search matching movies.");
  }

  return (matchedMovies as MatchedMovie[]) || [];
}

export async function validateAndGenerateReason({
  userInput,
  movie,
  isLowMatch,
}: {
  userInput: string;
  movie: MatchedMovie;
  isLowMatch: boolean;
}): Promise<{ isRelevant: boolean; reason: string }> {
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
            isRelevant: {
              type: Type.BOOLEAN,
              description:
                "True if user input is related to movies, tastes, or entertainment moods. False if off-topic.",
            },
            reason: {
              type: Type.STRING,
              description:
                "The engaging recommendation reason if relevant, or empty string if irrelevant.",
            },
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
    console.warn("Gemini API Error or JSON Parse error:", error.message);
    return {
      isRelevant: true,
      reason: `This movie 《${movie.title}》 (${movie.release_year}) is perfect for you!`,
    };
  }
}
