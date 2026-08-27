import { GoogleGenAI } from "@google/genai";

// Instantiate SDK (Read process.env.GEMINI_API_KEY automatically)
const ai = new GoogleGenAI();

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      // Optional: Set the output dimensionality
      config: {
        outputDimensionality: 768, 
      },
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error("Empty embedding array returned from Gemini API");
    }

    return embedding;
  } catch (error) {
    console.error("Gemini Embedding API Error Details:", error);
    throw new Error("Failed to generate embedding");
  }
}
