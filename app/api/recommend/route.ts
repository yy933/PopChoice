import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openrouter";
import type { Movie, MatchedMovie } from "@/types";

const CHAT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export async function POST(req: Request) {
  try {
    // 1. Receive the request
    const body = await req.json();
    const { userInput } = body;
    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json(
        {
          error: "Please provide a valid input.",
        },
        { status: 400 },
      );
    }

    // 2. Generate query embedding
    const queryEmbedding = await generateEmbedding(userInput);

    // 3. Vector search via Supabase RPC
    const movies = await vectorSearch(queryEmbedding);

    if (movies.length === 0) {
      return NextResponse.json(
        { message: "No matching movies found.", movies: [] },
        { status: 404 },
      );
    }

    // 4. LLM Reason Generation via OpenRouter
    const topMovie = movies[0];
    const recommendationReason = await chat({ userInput, movie: topMovie });

    // 5. Return response
    return NextResponse.json({
      recommendation: {
        movie: {
          id: topMovie.id,
          title: topMovie.title,
          releaseYear: topMovie.release_year,
          content: topMovie.content,
          similarity: topMovie.similarity,
        },
        reason: recommendationReason,
      },
      // return 2 other candidates
      candidateMovies: movies.slice(1).map(
        (movie: MatchedMovie): Movie => ({
          id: movie.id,
          title: movie.title,
          releaseYear: movie.release_year,
          content: movie.content,
          similarity: movie.similarity,
        }),
      ),
    });
  } catch (error: any) {
    console.error("API Route /api/recommend error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function vectorSearch(embedding: number[]): Promise<MatchedMovie[]> {
  // Vector search via Supabase RPC
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

async function chat({
  userInput,
  movie,
}: {
  userInput: string;
  movie: MatchedMovie;
}) {
  // 4. LLM Reason Generation via OpenRouter
  const prompt = `User Mood/Preference: "${userInput}"
Movie Title: "${movie.title}" (${movie.release_year})
Movie Description: "${movie.content}"

Based on the user's mood/preferences and this movie, explain in an engaging and persuasive tone why this movie is a perfect fit for them. Keep it concise (around 2-3 sentences). `.trim();

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a warm, cinematic movie recommendation agent.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const recommendationReason =
    response.choices[0]?.message?.content || "This movie is perfect for you!";

  return recommendationReason;
}
