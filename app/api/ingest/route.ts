import { supabase } from "@/lib/supabase";
import { movies } from "@/data/content";
import { generateEmbedding } from "@/lib/embeddings";
import { NextResponse } from "next/server";

// insert data into supabase
export async function GET() {
  try {
    // 1. generate embeddings altogether
    const moviesToInsert = await Promise.all(
      movies.map(async (movie) => {
        const textToEmbed = `Title: ${movie.title} (${movie.releaseYear}). ${movie.content}`;
        const embedding = await generateEmbedding(textToEmbed);
        return {
          title: movie.title,
          release_year: parseInt(movie.releaseYear, 10),
          content: movie.content,
          embedding: embedding,
        };
      }),
    );

    // 2. Batch insert data into Supabase (only sending HTTP Request once)
    const { data, error } = await supabase
      .from("movies")
      .insert(moviesToInsert)
      .select();

    if (error) {
      console.error("Supabase error. Failed to ingest movies:", error);
      throw error;
    }

    return NextResponse.json({
      message: "Successfully ingested movies data into Supabase.",
      ingestedCount: data.length,
      movies: data,
    });
  } catch (error: any) {
    console.error("Ingestion process error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
