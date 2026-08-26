export interface MatchedMovie {
  id: number;
  title: string;
  release_year: number;
  content: string;
  similarity: number;
}

export interface Movie {
  id: number;
  title: string;
  releaseYear: number | string;
  content: string;
  similarity?: number;
}
