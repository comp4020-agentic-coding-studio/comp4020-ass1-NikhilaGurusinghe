"use client";

import { useActorRef } from "@xstate/react";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import type { SelectAllSquaresAsset } from "@/app/components/minigames/captcha/assets/select-all-squares";
import {
  type CaptchaIteration,
  CaptchaMode,
  captchaModeToColumns,
  generateCaptchaIterations,
  initBooleanGrid,
} from "@/app/components/minigames/captcha/utils/captcha-utils";
import {
  GameManager,
  GameManagerTransitions,
} from "@/app/game/state/game-manager";
import type { MinigameStats } from "@/app/game/types/minigame-stats";
import { basePath } from "@/lib/base-path";
import type { SelectImagesAsset } from "./assets/select-images";

export default function Captcha() {
  const maxIterations: number = 3;

  // our state machine
  const actorRef = useActorRef(GameManager);

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
  // i feel like captchIterations really shouldn't be a useState here
  const captchaIterationsRef = useRef<
    CaptchaIteration[]
  >(generateCaptchaIterations(maxIterations));
  const [currIteration, setCurrIteration] = useState<number>(0);
  const [gridAnswers, setGridAnswers] = useState<boolean[][]>();
  const [isTutorialVisible, setIsTutorialVisible] = useState<boolean>(true);

  useEffect(() => {
    if (gridAnswers) return;

    const mode = captchaIterationsRef.current[currIteration].mode;
    const newColumns = captchaModeToColumns(mode);
    const newRows = captchaModeToColumns(mode);

    setGridAnswers(initBooleanGrid(newRows, newColumns));
  }, [captchaIterationsRef.current, currIteration, gridAnswers]);

  // still not ready to render
  if (!gridAnswers) return null;

  const currMode: CaptchaMode = captchaIterationsRef.current[currIteration].mode;
  const columns: number = captchaModeToColumns(currMode);
  const rows: number = columns;
  const subMinigameStats: MinigameStats[] = [];

  console.log(gridAnswers);

  function handleGridClick(x: number, y: number) {
    setGridAnswers((prevGrid: boolean[][] | undefined) => {
      if (!prevGrid) return initBooleanGrid(rows, columns);

      const gridCopy: boolean[][] = prevGrid.map((row: boolean[]) => [...row]);
      gridCopy[y][x] = !gridCopy[y][x];
      return gridCopy;
    });
  }

  function handleNextClick(): void {
    if (!gridAnswers) return;

    // TODO test this
    // we want to transition out of the minigame state
    if (currIteration >= maxIterations - 1) {
      const subMinigameStatsTotals: MinigameStats = subMinigameStats.reduce(
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
        accuracy: subMinigameStatsTotals.accuracy / subMinigameStats.length,
        timePerTask:
          subMinigameStatsTotals.timePerTask / subMinigameStats.length,
        salary: subMinigameStatsTotals.salary,
      };

      // goodbye :wave_emoji:
      actorRef.send({
        type: GameManagerTransitions.NEXT,
        previousMinigameStats: finalMinigameStats,
      });
    }

    // calculating accuracy
    let accuracy: number = 0;
    captchaIterationsRef.current[currIteration].assets.solutions.forEach(
      (solutionRow: boolean[], rowIndex: number) => {
        solutionRow.forEach((solution: boolean, columnIndex: number) => {
          if (solution === gridAnswers[rowIndex][columnIndex]) {
            accuracy += 1;
          }
        });
      },
    );
    accuracy /= rows * columns;

    // stop timer from previous iteration's next button press or from the tutorial next button
    const elapsedTime: number = stopTimer() ?? 0;

    // TODO need to update salary here
    // keeping track of scores
    subMinigameStats.push({
      accuracy: accuracy,
      timePerTask: elapsedTime,
      salary: 0,
    });

    // updating our grid and our iteration counter
    setCurrIteration((prevVal: number) => {
      const nextIteration: number = Math.min(prevVal + 1, maxIterations - 1);

      const nextMode = captchaIterationsRef.current[nextIteration].mode;
      const newColumns = captchaModeToColumns(nextMode);
      const newRows = captchaModeToColumns(nextMode);
      setGridAnswers(initBooleanGrid(newRows, newColumns));

      return nextIteration;
    });

    // start timer for next iteration
    startTimer();
  }

  return (
    <>
      <div className="text-white">{(elapsedMS / 1000).toFixed(0)}</div>
      <div className="w-full bg-white p-1 rounded-xl">
        {currMode === CaptchaMode.SELECT_ALL_SQUARES && (
          <div>
            Select all squares with <br />{" "}
            {captchaIterationsRef.current[currIteration].assets.objectToIdentify}
            <br />
            If there are none, click next
          </div>
        )}
        {currMode === CaptchaMode.SELECT_IMAGES && (
          <div>
            Select all images with <br />{" "}
            {captchaIterationsRef.current[currIteration].assets.objectToIdentify}
          </div>
        )}

        <div
          className="grid aspect-square"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns * rows }).map((_, index) => {
            const x: number = index % columns;
            const y: number = Math.floor(index / columns);

            return (
              <Fragment key={index}>
                {currMode === CaptchaMode.SELECT_ALL_SQUARES && (
                  <button
                    type={"button"}
                    onClick={() => handleGridClick(x, y)}
                    className={`bg-no-repeat cursor-pointer bg-cover transition-transform m-0.5 ${gridAnswers[y][x] ? "scale-80" : "scale-100"} ${x === 0 && y === 0 ? "rounded-tl-xl" : undefined} ${x === 0 && y === rows - 1 ? "rounded-bl-xl" : undefined} ${x === columns - 1 && y === rows - 1 ? "rounded-br-xl" : undefined} ${x === columns - 1 && y === 0 ? "rounded-tr-xl" : undefined}`}
                    style={{
                      backgroundImage: `url(${(captchaIterationsRef.current[currIteration].assets as SelectAllSquaresAsset).imagePath})`,
                      backgroundSize: `${columns * 100}% ${rows * 100}%`,
                      backgroundPosition: `${(x / (columns - 1)) * 100}% ${(y / (rows - 1)) * 100}%`,
                    }}
                  >
                    {gridAnswers[y][x] && (
                      <div
                        className={`block absolute drop-shadow-md/50 bg-(--highlight-colour) rounded-full md:w-9 w-10 aspect-square top-0 left-0 -translate-x-4/10 -translate-y-4/10`}
                      >
                        <Image
                          src={`${basePath}/icons/tick.png`}
                          alt=""
                          className="invert"
                          width={512}
                          height={512}
                        />
                      </div>
                    )}
                  </button>
                )}
                {currMode === CaptchaMode.SELECT_IMAGES && (
                  <button
                    type={"button"}
                    onClick={() => handleGridClick(x, y)}
                    className={`bg-no-repeat cursor-pointer bg-cover transition-transform m-0.5 ${gridAnswers[y][x] ? "scale-90" : "scale-100"} ${x === 0 && y === 0 ? "rounded-tl-xl" : undefined} ${x === 0 && y === rows - 1 ? "rounded-bl-xl" : undefined} ${x === columns - 1 && y === rows - 1 ? "rounded-br-xl" : undefined} ${x === columns - 1 && y === 0 ? "rounded-tr-xl" : undefined}`}
                    style={{
                      backgroundImage: `url(${(captchaIterationsRef.current[currIteration].assets as SelectImagesAsset).imagePaths[y][x]})`,
                      backgroundSize: `${columns * 100}% ${rows * 100}%`,
                      backgroundPosition: `${(x / (columns - 1)) * 100}% ${(y / (rows - 1)) * 100}%`,
                    }}
                  >
                    {gridAnswers[y][x] && (
                      <div
                        className={`block absolute drop-shadow-md/50 bg-(--highlight-colour) rounded-full md:w-9 w-10 aspect-square top-0 left-0 -translate-x-4/10 -translate-y-4/10`}
                      >
                        <Image
                          src={`${basePath}/icons/tick.png`}
                          alt=""
                          className="invert"
                          width={512}
                          height={512}
                        />
                      </div>
                    )}
                  </button>
                )}
              </Fragment>
            );
          })}
        </div>

        <button
          type={"button"}
          className="cursor-pointer"
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
