"use client";

import { useRef, useState } from "react";
import { GameManagerTransitions } from "@/app/game/state/game-manager";
import { GameManagerContext } from "@/app/game/state/game-manager-context";
import type { MinigameStats } from "@/app/game/types/minigame-stats";
import { calculateTaskSalary } from "@/app/game/utils/salary-utils";
import { formatTimer } from "@/lib/format-timer";
import {
  type ToneRatingAsset,
  toneRatingAssets,
} from "./assets/tone-rating-assets";
import {
  calculateToneRatingAccuracy,
  initToneRatingSelections,
  TONE_RATING_SCALE_MAX,
  TONE_RATING_SCALE_MIN,
  TONE_SPECTRUMS,
  type ToneRatingSelections,
  type ToneSpectrum,
} from "./utils/tone-rating-utils";

const RATING_VALUES: number[] = Array.from(
  { length: TONE_RATING_SCALE_MAX - TONE_RATING_SCALE_MIN + 1 },
  (_, index: number) => TONE_RATING_SCALE_MIN + index,
);

export default function ToneRating() {
  const maxIterations: number = 3;

  // our state machine
  const actorRef = GameManagerContext.useActorRef();

  // timer related
  const startTimeRef = useRef<number | null>(null);
  const timerAnimationFrameRef = useRef<number | null>(null);
  const [elapsedMS, setElapsedMS] = useState<number>(0);
  function tick() {
    if (startTimeRef.current !== null) {
      setElapsedMS(performance.now() - startTimeRef.current);
      timerAnimationFrameRef.current = requestAnimationFrame(tick);
    }
  }
  function startTimer(): void {
    startTimeRef.current = performance.now();
    timerAnimationFrameRef.current = requestAnimationFrame(tick);
  }
  function stopTimer(): number | null {
    if (startTimeRef.current == null) return null;

    if (timerAnimationFrameRef.current !== null) {
      cancelAnimationFrame(timerAnimationFrameRef.current);
      timerAnimationFrameRef.current = null;
    }

    const durationMS: number = performance.now() - startTimeRef.current;
    startTimeRef.current = null;

    return durationMS;
  }

  // minigame orchestration
  const toneRatingAssetsRef = useRef<ToneRatingAsset[]>(
    toneRatingAssets.sort(() => Math.random() - 0.5).slice(0, maxIterations),
  );
  const [currIteration, setCurrIteration] = useState<number>(0);
  const [selections, setSelections] = useState<ToneRatingSelections>(
    initToneRatingSelections(),
  );
  const [isTutorialVisible, setIsTutorialVisible] = useState<boolean>(true);
  const currAsset: ToneRatingAsset = toneRatingAssetsRef.current[currIteration];

  // accumulated across the whole game (not reset on re-render), so the final
  // aggregate at the last iteration averages over all iterations, not just one
  const subMinigameStatsRef = useRef<MinigameStats[]>([]);

  function handleSpectrumSelect(key: string, value: number): void {
    setSelections((prevSelections: ToneRatingSelections) => ({
      ...prevSelections,
      [key]: value,
    }));
  }

  const allSpectrumsRated: boolean = TONE_SPECTRUMS.every(
    (spectrum: ToneSpectrum) => selections[spectrum.key] !== null,
  );

  function handleNextClick(): void {
    if (!allSpectrumsRated) return;

    // stop timer from previous iteration's next button press or from the tutorial next button
    const elapsedTime: number = stopTimer() ?? 0;

    const accuracy: number = calculateToneRatingAccuracy(
      currAsset.solution,
      selections,
    );

    // record this iteration's stats before the aggregation below, so the last
    // iteration is included in its own final average
    subMinigameStatsRef.current.push({
      accuracy,
      timePerTask: elapsedTime,
      salary: calculateTaskSalary(accuracy, elapsedTime, maxIterations),
    });

    // we want to transition out of the minigame state
    if (currIteration >= maxIterations - 1) {
      const subMinigameStatsTotals: MinigameStats =
        subMinigameStatsRef.current.reduce(
          (
            acc: MinigameStats,
            { accuracy, timePerTask, salary }: MinigameStats,
          ) => ({
            accuracy: acc.accuracy + accuracy,
            timePerTask: acc.timePerTask + timePerTask,
            salary: acc.salary + salary,
          }),
          { accuracy: 0, timePerTask: 0, salary: 0 },
        );

      const finalMinigameStats: MinigameStats = {
        accuracy:
          subMinigameStatsTotals.accuracy / subMinigameStatsRef.current.length,
        timePerTask:
          subMinigameStatsTotals.timePerTask /
          subMinigameStatsRef.current.length,
        // money should be a whole number, even though the per-iteration
        // stats it's summed from aren't
        salary: Math.round(subMinigameStatsTotals.salary),
      };

      // goodbye :wave_emoji:
      actorRef.send({
        type: GameManagerTransitions.NEXT,
        previousMinigameStats: finalMinigameStats,
      });
    }

    // updating our iteration counter and clearing the ratings for the next conversation
    setCurrIteration((prevVal: number) =>
      Math.min(prevVal + 1, maxIterations - 1),
    );
    setSelections(initToneRatingSelections());

    // start timer for next iteration
    startTimer();
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Rate the following conversation</h1>
      <span className="text-left">{formatTimer(elapsedMS)} spent on task</span>
      <div className="w-full bg-(--background-secondary) p-1 flex flex-col gap-4">
        <section className="w-full overflow-y-auto flex flex-col gap-2 p-2">
          <span className="self-end max-w-[80%]">
            <h2 className="text-right">
              human
            </h2>
            <p className="bg-sky-600 rounded-2xl text-white px-4 py-2">
              {currAsset.userMessage}
            </p>
          </span>
          <span className="self-start max-w-[80%]">
            <h2 className="text-left">
              Assistant
            </h2>
            <p className="rounded-2xl bg-gray-200 px-4 py-2">
              {currAsset.llmResponse}
            </p>
          </span>
        </section>

        <div className="flex flex-col gap-4">
          {TONE_SPECTRUMS.map((spectrum: ToneSpectrum) => (
            <div key={spectrum.key}>
            <h2> Rate the assistant's {spectrum.key}</h2>
            <div className="flex items-center gap-2 border border-gray-400 p-4 rounded-md">
              <span className="w-16 text-right">
                {spectrum.lowLabel}
              </span>
              <div className="flex flex-1 justify-between px-5">
                {RATING_VALUES.map((value: number) => {
                  const isSelected: boolean =
                    selections[spectrum.key] === value;

                  return (
                    <label
                      key={value}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={spectrum.key}
                        checked={isSelected}
                        onChange={() => handleSpectrumSelect(spectrum.key, value)}
                        className="sr-only"
                      />
                      <span className="w-5 h-5 rounded-full border-2 border-gray-500 bg-white flex items-center justify-center">
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                        )}
                      </span>
                      <span className="text-xs">{value}</span>
                    </label>
                  );
                })}
              </div>
              <span className="w-16">{spectrum.highLabel}</span>
            </div>
            </div >
          ))}
        </div>

        <button
          type={"button"}
          disabled={!allSpectrumsRated}
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 diabled:bg-(--highlight-dark) rounded-md text-white w-full py-4 hover:bg-(--highlight-dark) bg-(--highlight-colour)"
          onClick={handleNextClick}
        >
          Next ➔ 
        </button>
      </div>
      {isTutorialVisible && (
        <div className="backdrop-blur-sm fixed inset-0 z-67 flex flex-col items-center justify-center">
          <div className="bg-(--background-secondary) border shadow-md/20 rounded-md border-gray-400 flex w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start">
            <h1 className="text-2xl font-bold">hello</h1>
            <button
              type={"button"}
              className="cursor-pointer rounded-md text-white w-full py-4 hover:bg-(--highlight-dark) bg-(--highlight-colour)"
              onClick={() => {
                setIsTutorialVisible(false);
                startTimer();
              }}
            >
              Start ➔
            </button>
          </div>
        </div>
      )}
    </>
  );
}
