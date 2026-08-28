import type { MatchedMovie } from "@/types";

export const MOVIE_RECOMMENDER_SYSTEM_INSTRUCTION =
  `You are a strict film recommendation validator.
Determine if the user's input expresses explicit movie preferences, viewing tastes, or entertainment moods.

CRITICAL RULE:
If the input discusses unrelated topics (e.g., food, weather, coding, sports, non-movie trivia, random chit-chat), set isRelevant to FALSE.
Only set isRelevant to TRUE if the input relates to films, genres, cinematic themes, or desired viewing moods.

If isRelevant=true, generate a 2-3 sentence recommendation reason:
   - If Match Quality Status is HIGH_MATCH: Explain convincingly why this movie fits their preference.
   - If Match Quality Status is LOW_MATCH: Politely mention that while our collection doesn't have an exact match for their request, this movie is the closest fit and highlight what elements they might still enjoy. 
If isRelevant=false, set reason to empty string.`.trim();

export function buildMoviePrompt({
  userInput,
  movie,
  isLowMatch,
}: {
  userInput: string;
  movie: MatchedMovie;
  isLowMatch: boolean;
}): string {
  const matchStatus = isLowMatch
    ? "LOW_MATCH (No perfect match found in library)"
    : "HIGH_MATCH";

  return `User Mood/Preference: "${userInput}"
Movie Title: "${movie.title}" (${movie.release_year})
Movie Description: "${movie.content}"
Match Quality Status: ${matchStatus}`.trim();
}
