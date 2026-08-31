import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import { vectorSearch, LOW_MATCH_THRESHOLD } from "@/lib/recommendation";
import { generateRecommendationReason } from "@/lib/llm";
import type { PersonAnswer, GroupConfig, MatchedMovie, Movie } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const config: GroupConfig = body.config;
    const answers: PersonAnswer[] = body.answers;

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: "No answers provided." },
        { status: 400 },
      );
    }

    // 1. combine answers of all people
    const groupSummary = answers
      .map(
        (answer, index) =>
          `Person ${index + 1}: Favors "${answer.favoriteMovie}", Era: "${answer.eraPreference}", Mood: "${answer.moodPreference}", Island Choice: "${answer.strandedActor}"`,
      )
      .join(" | ");

    const userInput = `Group of ${config.peopleCount} people (Time limit: ${config.timeLimit}). Preferences: ${groupSummary}`;

    // 2. Embedding and vector search (Supabase)
    const queryEmbedding = await generateEmbedding(userInput);
    const movies = await vectorSearch(queryEmbedding);

    if (movies.length === 0) {
      return NextResponse.json(
        { message: "No matching movies found.", movies: [] },
        { status: 404 },
      );
    }

    const topMovie = movies[0];
    const isLowMatch = topMovie.similarity < LOW_MATCH_THRESHOLD;

    // 3.  Match Evaluation & Reason Generation (LLM)
    const { isRelevant, reason } = await generateRecommendationReason({
      userInput,
      movie: topMovie,
      isLowMatch,
    });

    if (!isRelevant) {
      return NextResponse.json(
        {
          error: "Irrelevant input.",
          message:
            "Your input does not seem related to movie preferences. Please share what kind of movies or vibe you enjoy!",
        },
        { status: 400 },
      );
    }

    // 4. Map & Return Data
    // format movie data
    const formatMovie = (movie: MatchedMovie): Movie => ({
      id: movie.id,
      title: movie.title,
      releaseYear: movie.release_year,
      content: movie.content,
      similarity: movie.similarity,
    });

    // return top 1 recs and candidate movie
    return NextResponse.json({
      recommendation: {
        movie: formatMovie(topMovie),
        reason,
        isLowMatch,
      },
      candidateMovies: movies.slice(1).map(formatMovie),
    });
  } catch (error: any) {
    console.error("API Route /api/recommend/group error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
