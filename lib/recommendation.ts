import { supabase } from "@/lib/supabase";
import { ai } from "@/lib/gemini";
import type { MatchedMovie } from "@/types";
import { Type } from "@google/genai";

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
  const prompt = `User Mood/Preference: "${userInput}"
Movie Title: "${movie.title}" (${movie.release_year})
Movie Description: "${movie.content}"
Match Quality Status: ${isLowMatch ? "LOW_MATCH (No perfect match found in library)" : "HIGH_MATCH"}`.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: `You are a strict film recommendation validator.
Determine if the user's input expresses explicit movie preferences, viewing tastes, or entertainment moods.

CRITICAL RULE:
If the input discusses unrelated topics (e.g., food, weather, coding, sports, non-movie trivia, random chit-chat), set isRelevant to FALSE.
Only set isRelevant to TRUE if the input relates to films, genres, cinematic themes, or desired viewing moods.

If isRelevant=true, generate a 2-3 sentence recommendation reason:
   - If Match Quality Status is HIGH_MATCH: Explain convincingly why this movie fits their preference.
   - If Match Quality Status is LOW_MATCH: Politely mention that while our collection doesn't have an exact match for their request, this movie is the closest fit and highlight what elements they might still enjoy. 
If isRelevant=false, set reason to empty string.`,
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
