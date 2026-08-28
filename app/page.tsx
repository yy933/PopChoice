"use client";

import { useActionState, startTransition } from "react";
import Header from "@/components/Header";
import Question from "@/components/Question";
import Button from "@/components/Button";
import LoadingUI from "@/components/LoadingUI";
import type { Movie } from "@/types";

type Recommendation = { movie: Movie; reason: string };
type RecommendResponse = {
  recommendation: Recommendation;
  candidateMovies?: Movie[];
};

export default function Home() {
  const [result, formAction, isPending] = useActionState(
    async (
      previousState: RecommendResponse | null,
      payload: FormData | "RESET",
    ) => {
      if (payload === "RESET") return null;
      const fav = payload.get("favoriteMovie") as string;
      const era = payload.get("eraPreference") as string;
      const mood = payload.get("moodPreference") as string;

      // merge user input as a single prompt
      const userInput = `My favorite movie is "${fav}". Era preference: "${era}". Mood preference: "${mood}".`;

      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userInput }),
        });

        if (!res.ok) throw new Error("API Request failed");

        return await res.json();
      } catch (err) {
        console.error(err);
        alert("Something went wrong while fetching movie recommendations.");
        return null;
      }
    },
    null,
  );
  const handleReset = () => {
    startTransition(() => {
      formAction("RESET");
    });
  };

  return (
    <main className="min-h-screen bg-[#030d2e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#030d2e] p-6 rounded-xl flex flex-col items-center">
        {/* Header Title with Logo */}
        <Header logo="🍿" title="PopChoice" />
        {/* Loading View */}
        {isPending && (
          <LoadingUI>Searching the movie database for you...</LoadingUI>
        )}
        {/* Status 1: Questions View */}
        {!isPending && !result && (
          <form action={formAction} className="w-full flex flex-col gap-5">
            <Question
              name="favoriteMovie"
              rows={3}
              placeholder="The Shawshank Redemption&#10;Because it taught me to never give up hope no matter how hard life gets"
            >
              What's your favorite movie?
            </Question>

            <Question
              name="eraPreference"
              rows={2}
              placeholder="I want to watch movies that were released after 1990"
            >
              Are you in the mood for something new or a classic?
            </Question>

            <Question
              name="moodPreference"
              rows={2}
              placeholder="I want to watch something stupid and fun"
            >
              Do you wanna have fun or do you want something serious?
            </Question>
            <Button type="submit" className="mt-3">
              Let's Go
            </Button>
          </form>
        )}

        {/* Movie Output View */}
        {!isPending && result && (
          <div className="w-full flex flex-col items-center text-center mt-2">
            <h2
              className="text-white text-3xl font-semibold mb-6"
              style={{ fontFamily: "var(--font-roboto-slab), serif" }}
            >
              {result.recommendation.movie.title} (
              {result.recommendation.movie.releaseYear})
            </h2>
            <p
              className="text-white text-sm leading-relaxed mb-6 px-2 text-left"
              style={{ fontFamily: "var(--font-roboto-slab), serif" }}
            >
              {result.recommendation.reason}
            </p>
            <Button onClick={handleReset} className="mt-4">
              Go Again
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
