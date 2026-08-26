import { openai } from "./openrouter";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "nvidia/llama-nemotron-embed-vl-1b-v2:free",
      input: text.replace(/\n/g, " "), // remove unnecessary newlines
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}
