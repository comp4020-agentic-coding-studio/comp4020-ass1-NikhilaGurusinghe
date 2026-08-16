"use client";

import { useRef, useState } from "react";
import { GameManagerTransitions } from "@/app/game/state/game-manager";
import { GameManagerContext } from "@/app/game/state/game-manager-context";
import type { MinigameStats } from "@/app/game/types/minigame-stats";
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

    // TODO calculate salary
    // record this iteration's stats before the aggregation below, so the last
    // iteration is included in its own final average
    subMinigameStatsRef.current.push({
      accuracy,
      timePerTask: elapsedTime,
      salary: 0,
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
        salary: subMinigameStatsTotals.salary,
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
      <div className="text-white">{(elapsedMS / 1000).toFixed(0)}</div>
      <div className="w-full bg-white p-1 rounded-xl flex flex-col gap-4">
        <div className="w-full max-h-48 overflow-y-auto flex flex-col gap-2 p-2">
          <div className="self-end max-w-[80%] rounded-2xl bg-(--highlight-colour) text-white px-4 py-2">
            {currAsset.userMessage}
          </div>
          <div className="self-start max-w-[80%] rounded-2xl bg-gray-200 px-4 py-2">
            {currAsset.llmResponse}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-2">
          {TONE_SPECTRUMS.map((spectrum: ToneSpectrum) => (
            <div key={spectrum.key} className="flex items-center gap-2">
              <span className="text-xs w-16 text-right">
                {spectrum.lowLabel}
              </span>
              <div className="flex flex-1 justify-center gap-3">
                {RATING_VALUES.map((value: number) => {
                  const isSelected: boolean =
                    selections[spectrum.key] === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSpectrumSelect(spectrum.key, value)}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 border-(--highlight-colour) ${isSelected ? "bg-(--highlight-colour) text-white" : "bg-white"}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs w-16">{spectrum.highLabel}</span>
            </div>
          ))}
        </div>

        <button
          type={"button"}
          disabled={!allSpectrumsRated}
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          onClick={handleNextClick}
        >
          next
        </button>
      </div>
      {isTutorialVisible && (
        <div className="backdrop-blur-sm fixed inset-0 z-67 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center bg-white w-full max-w-3xl">
            hello
            <button
              type={"button"}
              className="cursor-pointer"
              onClick={() => {
                setIsTutorialVisible(false);
                startTimer();
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
