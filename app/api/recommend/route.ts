import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";
// import { openai } from "@/lib/openrouter";
import type { Movie, MatchedMovie } from "@/types";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI();
const LOW_MATCH_THRESHOLD = 0.35
// const CHAT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

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
    const isLowMatch = topMovie.similarity < LOW_MATCH_THRESHOLD;
   
    const { isRelevant, reason } = await chat({ userInput, movie: topMovie, isLowMatch });

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
        reason: reason,
        isLowMatch,
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
  isLowMatch
}: {
  userInput: string;
  movie: MatchedMovie;
  isLowMatch: boolean
}): Promise<{ isRelevant: boolean; reason: string }> {
  // 4. LLM Reason Generation
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

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);

    return {
      isRelevant: Boolean(parsed.isRelevant),
      reason:
        parsed.reason ||
        `This movie 《${movie.title}》 (${movie.release_year}) is highly recommended for you!`,
    };
  } catch (error: any) {
    console.warn("Gemini API Error or JSON Parse error:", error.message);
    console.error("Full Error:", error);

    // default reason(when reach API limit or error)
    return {
      isRelevant: true,
      reason: `This movie 《${movie.title}》 (${movie.release_year}) is perfect for you!`,
    };
  }
}
