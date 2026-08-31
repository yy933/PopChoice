"use client";

import { useState, useActionState, startTransition } from "react";
import Header from "@/components/Header";
import Question from "@/components/Question";
import Button from "@/components/Button";
import LoadingUI from "@/components/LoadingUI";
import type { Movie, PersonAnswer, GroupConfig, ViewState } from "@/types";

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
  errorMessage: string | null;
};

const INITIAL_STATE: FormState = {
  view: "CONFIG",
  config: { peopleCount: 1, timeLimit: "" },
  currentPersonIndex: 0,
  answers: [],
  result: null,
  currentCandidateIndex: 0,
  errorMessage: null,
};

// helper for parsing form data
const parseField = (formData: FormData, key: string, defaultValue = "") =>
  (formData.get(key) as string) || defaultValue;

export default function Home() {
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: FormState,
      payload: FormData | "RESET",
    ): Promise<FormState> => {
      // Handle reset
      if (payload === "RESET") {
        return INITIAL_STATE;
      }

      // View 1: handle group config (CONFIG -> QUESTIONS)
      if (previousState.view === "CONFIG") {
        const countRaw = parseField(payload, "peopleCount");
        const timeLimit = parseField(payload, "timeLimit", "Unlimited");
        const peopleCount = parseInt(countRaw, 10) || 1;

        return {
          ...previousState,
          view: "QUESTIONS",
          config: { peopleCount, timeLimit },
          currentCandidateIndex: 0,
          answers: [],
          errorMessage: null,
        };
      }

      // View 2: Handle individual answer (QUESTIONS)
      if (previousState.view === "QUESTIONS") {
        const currentAnswer: PersonAnswer = {
          favoriteMovie: parseField(payload, "favoriteMovie"),
          eraPreference: parseField(payload, "eraPreference"),
          moodPreference: parseField(payload, "moodPreference"),
          strandedActor: parseField(payload, "strandedActor"),
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
            errorMessage: null,
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

          // data from API call
          const data = await res.json();

          if (!res.ok) {
            return {
              ...previousState,
              errorMessage:
                data.message || data.error || "Something went wrong.",
            };
          }

          return {
            ...previousState,
            view: "RESULT",
            answers: updatedAnswers,
            result: data as RecommendResponse,
            currentCandidateIndex: 0,
            errorMessage: null,
          };
        } catch (err) {
          console.error(err);
          return {
            ...previousState,
            errorMessage:
              "Network error or server is unreachable. Please try again later.",
          };
        }
      }
      return previousState;
    },
    INITIAL_STATE,
  );

  // Handle "Next Movie"
  const [candidateOffset, setCandidateOffset] = useState(0);
  const handleNextMovie = () => {
    if (!state.result) return;
    const allMovies = [
      state.result.recommendation.movie,
      ...(state.result.candidateMovies || []),
    ];
    setCandidateOffset((prev) => (prev + 1) % allMovies.length);
  };

  // get current movie and recommend reason
  const allMovies = state.result
    ? [
        state.result.recommendation.movie,
        ...(state.result.candidateMovies || []),
      ]
    : [];
  const activeMovie =
    allMovies[candidateOffset] || state.result?.recommendation.movie;

  const handleReset = () => {
    startTransition(() => {
      formAction("RESET");
      setCandidateOffset(0);
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
        {/* Error message */}
        {state.errorMessage && !isPending && (
          <div className="w-full bg-red-500/10 border border-red-500/50 text-red-300 text-sm p-3 rounded-lg text-center mb-4">
            {state.errorMessage}
          </div>
        )}

        {/* VIEW 1: Start View - Config */}
        {!isPending && state.view === "CONFIG" && (
          <form action={formAction} className="w-full flex flex-col gap-5 mt-4">
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
        {/* VIEW 2: Individula group answers */}
        {!isPending && state.view === "QUESTIONS" && (
          <form
            key={state.currentPersonIndex}
            action={formAction}
            className="w-full flex flex-col gap-4 mt-2"
          >
            <div className="text-center text-emerald-400 font-bold text-xl mb-1">
              Person {state.currentPersonIndex + 1} of{" "}
              {state.config.peopleCount}
            </div>

            <Question
              name="favoriteMovie"
              rows={2}
              placeholder="The Shawshank Redemption&#10;Because it taught me to never give up..."
            >
              What's your favorite movie and why?
            </Question>

            <Question
              name="eraPreference"
              rows={1}
              placeholder="New or Classic?"
            >
              Are you in the mood for something new or a classic?
            </Question>

            <Question
              name="moodPreference"
              rows={1}
              placeholder="Fun, Serious, Inspiring, Scary..."
            >
              What are you in the mood for?
            </Question>

            <Question
              name="strandedActor"
              rows={2}
              placeholder="Tom Hanks because he is really funny..."
            >
              Which famous film person would you love to be stranded on an
              island with and why?
            </Question>

            <Button type="submit" className="mt-3">
              {state.currentPersonIndex + 1 === state.config.peopleCount
                ? "Get Movie"
                : "Next Person"}
            </Button>
          </form>
        )}

        {/* Movie Output View */}
        {!isPending && state.view === "RESULT" && activeMovie && (
          <div className="w-full flex flex-col items-center text-center mt-2">
            <h2
              className="text-white text-3xl font-semibold mb-6"
              style={{ fontFamily: "var(--font-roboto-slab), serif" }}
            >
              {activeMovie.title} ({activeMovie.releaseYear})
            </h2>
            <p
              className="text-white text-sm leading-relaxed mb-6 px-2 text-left"
              style={{ fontFamily: "var(--font-roboto-slab), serif" }}
            >
              {candidateOffset === 0
                ? state.result?.recommendation.reason
                : activeMovie.content}
            </p>

            <div className="w-full flex flex-col gap-3">
              {allMovies.length > 1 && (
                <Button onClick={handleNextMovie} type="button">
                  Next Movie
                </Button>
              )}
              <Button
                onClick={handleReset}
                type="button"
                className="bg-gray-300 hover:bg-gray-400"
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
