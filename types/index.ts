export type ViewState =
  | "CONFIG" // View 1: choose people, available time
  | "QUESTIONS" // View 2:  1 ~ N person answer questions
  | "LOADING" // View 3: API fetching
  | "RESULT"; // View 4: Results and Next Movie carousel
export type GroupConfig = {
  peopleCount: number;
  timeLimit: string;
};

export type PersonAnswer = {
  favoriteMovie: string;
  eraPreference: string;
  moodPreference: string;
  strandedActor: string; 
}

export type GroupRecommendPayload = {
  config: GroupConfig;
  answers: PersonAnswer[];
}

export type MatchedMovie = {
  id: number;
  title: string;
  release_year: number;
  content: string;
  similarity: number;
};

export type Movie = {
  id: number;
  title: string;
  releaseYear: number | string;
  content: string;
  similarity?: number;
};

export interface LLMReasonParams {
  userInput: string;
  movie: MatchedMovie;
  isLowMatch: boolean;
}

export interface LLMReasonResponse {
  isRelevant: boolean;
  reason: string;
}
