import { generateReasonWithGemini } from "./gemini";
import { generateReasonWithOpenRouter } from "./openrouter";
import type { MatchedMovie } from "@/types";

export async function generateRecommendationReason(params: any) {
  const provider = process.env.LLM_PROVIDER || "gemini";

  if (provider === "openrouter") {
    return await generateReasonWithOpenRouter(params);
  }

  return await generateReasonWithGemini(params);
}
