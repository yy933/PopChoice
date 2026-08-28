export type MatchedMovie = {
  id: number;
  title: string;
  release_year: number;
  content: string;
  similarity: number;
}

export type Movie = {
  id: number;
  title: string;
  releaseYear: number | string;
  content: string;
  similarity?: number;
}

export interface LLMReasonParams {
  userInput: string;
  movie: MatchedMovie;
  isLowMatch: boolean;
}

export interface LLMReasonResponse {
  isRelevant: boolean;
  reason: string;
}