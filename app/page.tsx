"use client";

import { useState, useActionState, startTransition } from "react";
import Header from "@/components/Header";
import Question from "@/components/Question";
import Button from "@/components/Button";
import LoadingUI from "@/components/LoadingUI";
import type { Movie, PersonAnswer, GroupConfig, ViewState } from "@/types";
import { config } from "process";

type Recommendation = { movie: Movie; reason: string; isLowMatch?: boolean };
type RecommendResponse = {
  recommendation: Recommendation;
  candidateMovies?: Movie[];
};
type FormState = {
  view: ViewState;
  config: GroupConfig;
  currentPersonIndex: number;
  answers: PersonAnswer[];
  result: RecommendResponse | null;
  currentCandidateIndex: number; // control switching of "Next Movie"
};

const INITIAL_STATE: FormState = {
  view: "CONFIG",
  config: { peopleCount: 1, timeLimit: "" },
  currentPersonIndex: 0,
  answers: [],
  result: null,
  currentCandidateIndex: 0,
};

export default function Home() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [result, formAction, isPending] = useActionState(
    async (
      previousState: FormState,
      payload: FormData | "RESET",
    ): Promise<FormState> => {
      // Handle reset
      if (payload === "RESET") {
        setErrorMessage(null);
        return INITIAL_STATE;
      }

      setErrorMessage(null);

      // View 1: handle group config (CONFIG -> QUESTIONS)
      if (previousState.view === "CONFIG") {
        const countRaw = payload.get("peopleCount") as string;
        const timeLimit = (payload.get("timeLimit") as string) || "Unlimited";
        const peopleCount = parseInt(countRaw, 10) || 1;

        return {
          ...previousState,
          view: "QUESTIONS",
          config: { peopleCount, timeLimit },
          currentCandidateIndex: 0,
          answers: [],
        };
      }

      // View 2: Handle individual answer (QUESTIONS)
      if (previousState.view === "QUESTIONS") {
        const currentAnswer: PersonAnswer = {
          favoriteMovie: (payload.get("favoriteMovie") as string) || "",
          eraPreference: (payload.get("eraPreference") as string) || "",
          moodPreference: (payload.get("moodPreference") as string) || "",
          strandedActor: (payload.get("strandedActor") as string) || "",
        };

        const updatedAnswers = [...previousState.answers, currentAnswer];
        const isLastPerson =
          previousState.currentPersonIndex + 1 >=
          previousState.config.peopleCount;

        if (!isLastPerson) {
          return {
            ...previousState,
            currentPersonIndex: previousState.currentPersonIndex + 1,
            answers: updatedAnswers,
          };
        }

        // when last person finished, call group API
        try {
          const res = await fetch("/api/recommend/group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              config: previousState.config,
              answers: updatedAnswers,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setErrorMessage(
              data.message ||
                data.error ||
                "Something went wrong. Please try again.",
            );
            return previousState;
          }

          return {
            ...previousState,
            view: "RESULT",
            answers: updatedAnswers,
            result: data as RecommendResponse,
            currentCandidateIndex: 0,
          };
        } catch (err) {
          console.error(err);
          setErrorMessage(
            "Network error or server is unreachable. Please try again later.",
          );
          return previousState;
        }
      }
      return previousState;
    },
    INITIAL_STATE,
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

        {/* VIEW 1: Start View - Config */}
        {!isPending && view === "CONFIG" && (
          <form
            onSubmit={handleConfigSubmit}
            className="w-full flex flex-col gap-5 mt-4"
          >
            <Question name="peopleCount" rows={1} placeholder="5">
              How many people?
            </Question>
            <Question
              name="timeLimit"
              rows={1}
              placeholder="2 hours 50 minutes"
            >
              How much time do you have?
            </Question>
            <Button type="submit" className="mt-3">
              Start
            </Button>
          </form>
        )}
        {/* Status 1: Questions View */}
        {!isPending && !result && (
          <form action={formAction} className="w-full flex flex-col gap-5">
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 text-sm p-3 rounded-lg text-center">
                {errorMessage}
              </div>
            )}
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
