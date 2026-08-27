"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Question from "@/components/Question";
import Button from "@/components/Button";
import LoadingUI from "@/components/LoadingUI";

interface RecommendResponse {
  recommendation: string;
  candidateMovies?: Array<{
    id: number;
    title: string;
    release_year: number;
    content: string;
  }>;
}

export default function Home() {
  // 問卷欄位 State
  const [favoriteMovie, setFavoriteMovie] = useState("");
  const [eraPreference, setEraPreference] = useState("");
  const [moodPreference, setMoodPreference] = useState("");

  // UI 狀態：'quiz' | 'loading' | 'result'
  const [status, setStatus] = useState<"quiz" | "loading" | "result">("quiz");
  const [result, setResult] = useState<RecommendResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // 整合問卷回答為單一 Prompt 字串
    const userInput = `My favorite movie is "${favoriteMovie}". Era preference: "${eraPreference}". Mood preference: "${moodPreference}".`;

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      if (!res.ok) throw new Error("API Request failed");

      const data: RecommendResponse = await res.json();
      setResult(data);
      setStatus("result");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while fetching movie recommendations.");
      setStatus("quiz");
    }
  };

  const handleReset = () => {
    setFavoriteMovie("");
    setEraPreference("");
    setMoodPreference("");
    setResult(null);
    setStatus("quiz");
  };

  return (
    <main className="min-h-screen bg-[#030d2e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#030d2e] p-6 rounded-xl flex flex-col items-center">
        {/* Header Title with Logo */}
        <Header logo="🍿" title="PopChoice" />

        {/* Status 1: Questions View */}
        {status === "quiz" && (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <Question
              rows={3}
              value={favoriteMovie}
              onChange={(e) => setFavoriteMovie(e.target.value)}
              placeholder="The Shawshank Redemption&#10;Because it taught me to never give up hope no matter how hard life gets"
            >
              What's your favorite movie?
            </Question>

            <Question
              rows={2}
              value={eraPreference}
              onChange={(e) => setEraPreference(e.target.value)}
              placeholder="I want to watch movies that were released after 1990"
            >
              Are you in the mood for something new or a classic?
            </Question>

            <Question
              rows={2}
              value={moodPreference}
              onChange={(e) => setMoodPreference(e.target.value)}
              placeholder="I want to watch something stupid and fun"
            >
              Do you wanna have fun or do you want something serious?
            </Question>
            <Button type="submit" className="mt-3">
              {" "}
              Let's Go
            </Button>
          </form>
        )}

        {/* Status 2: Loading View */}
        {status === "loading" && (
          <LoadingUI>Searching the movie database for you...</LoadingUI>
        )}

        {/* Status 3: Movie Output View */}
        {status === "result" && result && (
          <div className="w-full flex flex-col items-center text-center mt-2">
            <p
              className="text-white text-sm leading-relaxed mb-6 px-2 text-left"
              style={{ fontFamily: "var(--font-roboto-slab), serif" }}
            >
              {result.recommendation}
            </p>
            <Button onClick={handleReset} className="mt-4">
              {" "}
              Go Again
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
