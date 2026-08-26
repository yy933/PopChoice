import { openai } from "./openrouter";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "liquid/lfm-2.5-embedding-350m:free",
      input: text.replace(/\n/g, " "), // remove unnecessary newlines
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}
