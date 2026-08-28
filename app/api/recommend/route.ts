// app/api/recommend/route.ts
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import {
  vectorSearch,
  validateAndGenerateReason,
  LOW_MATCH_THRESHOLD,
} from "@/lib/recommendation";
import type { Movie, MatchedMovie } from "@/types";

export async function POST(req: Request) {
  try {
    // 1. Validate Input
    const body = await req.json();
    const userInput =
      typeof body.userInput === "string" ? body.userInput.trim() : "";

    if (!userInput) {
      return NextResponse.json(
        { error: "Please provide a valid input." },
        { status: 400 },
      );
    }

    // 2. Embedding & DB Vector Search
    const queryEmbedding = await generateEmbedding(userInput);
    const movies = await vectorSearch(queryEmbedding);

    if (movies.length === 0) {
      return NextResponse.json(
        { message: "No matching movies found.", movies: [] },
        { status: 404 },
      );
    }

    // 3. Match Evaluation & Reason Generation
    const topMovie = movies[0];
    const isLowMatch = topMovie.similarity < LOW_MATCH_THRESHOLD;

    const { isRelevant, reason } = await validateAndGenerateReason({
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
    const formatMovie = (movie: MatchedMovie): Movie => ({
      id: movie.id,
      title: movie.title,
      releaseYear: movie.release_year,
      content: movie.content,
      similarity: movie.similarity,
    });

    return NextResponse.json({
      recommendation: {
        movie: formatMovie(topMovie),
        reason,
        isLowMatch,
      },
      candidateMovies: movies.slice(1).map(formatMovie),
    });
  } catch (error: any) {
    console.error("API Route /api/recommend error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
