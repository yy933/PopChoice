import { supabase } from "@/lib/supabase";
import { movies } from "@/data/content";
import { generateEmbedding } from "@/lib/embeddings";
import { NextResponse } from "next/server";

// Chunk array into specific size
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function GET() {
  try {
    const moviesToInsert = [];
    // Sending a batch of 5 Embedding requests at a time to prevent rate limiting
    const BATCH_SIZE = 5;
    const movieChunks = chunkArray(movies, BATCH_SIZE);

    for (const chunk of movieChunks) {
      // 1. Generate Embedding batches
      const chunkResults = await Promise.all(
        chunk.map(async (movie) => {
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

      moviesToInsert.push(...chunkResults);

      // Optional: Add a delay between batches
      // await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // 2.  Batch Insert into Supabase after all embeddings are generated
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
