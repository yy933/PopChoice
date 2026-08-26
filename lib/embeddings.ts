import { openai } from "./openrouter";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "liquid/lfm-2.5-embedding-350m:free",
      input: text.replace(/\n/g, " "), // remove unnecessary newlines
    });

    const embedding = response.data[0].embedding;
    if (typeof embedding === "string") {
      return JSON.parse(embedding);
    }
    return embedding as number[];
  } catch (error) {
    console.error("OpenRouter Embedding API Error Details:", error);
    throw new Error("Failed to generate embedding");
  }
}
