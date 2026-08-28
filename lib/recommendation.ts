import { supabase } from "@/lib/supabase";
import { generateRecommendationReason } from "@/lib/llm";
import { ai } from "@/lib/gemini-client";
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

export async function validateAndGenerateReason(params: {
  userInput: string;
  movie: MatchedMovie;
  isLowMatch: boolean;
}) {
  return await generateRecommendationReason(params);
}
