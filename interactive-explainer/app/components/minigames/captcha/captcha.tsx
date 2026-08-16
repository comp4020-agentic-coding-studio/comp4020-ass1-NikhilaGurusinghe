"use client";

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
import { GameManagerTransitions } from "@/app/game/state/game-manager";
import { GameManagerContext } from "@/app/game/state/game-manager-context";
import type { MinigameStats } from "@/app/game/types/minigame-stats";
import { calculateTaskSalary } from "@/app/game/utils/salary-utils";
import { basePath } from "@/lib/base-path";
import { formatTimer } from "@/lib/format-timer";
import type { SelectImagesAsset } from "./assets/select-images";

export default function Captcha() {
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
  // i feel like captchIterations really shouldn't be a useState here
  const captchaAssetsRef = useRef<CaptchaIteration[]>(
    generateCaptchaIterations(maxIterations),
  );
  const [currIteration, setCurrIteration] = useState<number>(0);
  const [gridAnswers, setGridAnswers] = useState<boolean[][]>();
  const [isTutorialVisible, setIsTutorialVisible] = useState<boolean>(true);
  // the tutorial overlay occludes the page underneath it, so the page
  // shouldn't be scrollable while it's up
  useEffect(() => {
    if (!isTutorialVisible) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isTutorialVisible]);
  // accumulated across the whole game (not reset on re-render), so the final
  // aggregate at the last iteration averages over all iterations, not just one
  const subMinigameStatsRef = useRef<MinigameStats[]>([]);

  useEffect(() => {
    if (gridAnswers) return;

    const mode = captchaAssetsRef.current[currIteration].mode;
    const newColumns = captchaModeToColumns(mode);
    const newRows = captchaModeToColumns(mode);

    setGridAnswers(initBooleanGrid(newRows, newColumns));
  }, [captchaAssetsRef.current, currIteration, gridAnswers]);

  // still not ready to render
  if (!gridAnswers) return null;

  const currMode: CaptchaMode = captchaAssetsRef.current[currIteration].mode;
  const columns: number = captchaModeToColumns(currMode);
  const rows: number = columns;

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

    // calculating accuracy
    let accuracy: number = 0;
    captchaAssetsRef.current[currIteration].assets.solutions.forEach(
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

    // record this iteration's stats before the aggregation below, so the last
    // iteration is included in its own final average
    subMinigameStatsRef.current.push({
      accuracy: accuracy,
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

    // updating our grid and our iteration counter
    setCurrIteration((prevVal: number) => {
      const nextIteration: number = Math.min(prevVal + 1, maxIterations - 1);

      const nextMode = captchaAssetsRef.current[nextIteration].mode;
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
     {currMode === CaptchaMode.SELECT_ALL_SQUARES && (
          <h1 className="text-2xl font-bold mb-2">
            Select all squares with <br />
            <span className="text-4xl">{captchaAssetsRef.current[currIteration].assets.objectToIdentify}</span>
            <br />
            If there are none, click next
          </h1>
        )}
        {currMode === CaptchaMode.SELECT_IMAGES && (
          <h1 className="text-2xl font-bold mb-2">
            Select all images with <br />
            <span className="text-4xl">{captchaAssetsRef.current[currIteration].assets.objectToIdentify}</span>
          </h1>
        )}
      <span className="text-left">{formatTimer(elapsedMS)} spent on task</span>
      <div className="w-full bg-(--background-secondary) p-1 flex flex-col gap-4">
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
                      backgroundImage: `url(${(captchaAssetsRef.current[currIteration].assets as SelectAllSquaresAsset).imagePath})`,
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
                      backgroundImage: `url(${(captchaAssetsRef.current[currIteration].assets as SelectImagesAsset).imagePaths[y][x]})`,
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
          className="cursor-pointer rounded-md text-white w-full py-4 hover:bg-(--highlight-dark) bg-(--highlight-colour)"
          onClick={handleNextClick}
        >
          Next ➔
        </button>
      </div>
      {isTutorialVisible && (
        <div className="backdrop-blur-sm fixed inset-0 z-67 flex flex-col items-center justify-center">
          <div className="bg-(--background-secondary) border shadow-md/20 rounded-md border-gray-400 flex w-full max-w-3xl max-h-[90vh] flex-col items-center py-12 px-8 sm:items-start">
              <h1 className="text-2xl font-bold mb-2">Captcha</h1>
            
            <div className="w-full min-h-0 overflow-y-auto flex flex-col items-center sm:items-start mb-4">
              <span className="border-l-2 pl-2 ml-2 my-3">
                <p>“[Google's Captcha] asks the user to identify images of crosswalks, street lights, and other objects. It has been hypothesized that the data is used by Waymo, a Google subsidiary, to train autonomous vehicles, though an unnamed representative has denied this, claiming the data was only being used to improve Google Maps as of mid-2021.”</p>
                <br></br>
                <a className="font-bold italic underline" href="https://en.wikipedia.org/wiki/ReCAPTCHA#">reCAPTCHA - Wikipedia</a>
                </span>
                <span className="border-l-2 pl-2 ml-2 my-3">
                <p>“This kind of invisible, hidden labor, outsourced or crowdsourced, hidden behind interfaces and camouflaged within algorithmic processes is now commonplace, particularly in the process of tagging and labeling thousands of hours of digital archives for the sake of feeding the neural networks. Sometimes this labor is entirely unpaid, as in the case of the Google’s reCAPTCHA. In a paradox that many of us have experienced, in order to prove that you are not artificial agent, you are forced to train Google’s image recognition AI system for free, by selecting multiple boxes that contain street numbers, or cars, or houses.</p>

                <p>As we see repeated throughout the system, contemporary forms of artificial intelligence are not so artificial after all”</p>
                <br></br>
                <a className="font-bold italic underline" href="https://anatomyof.ai/">Anatomy of AI - Kate Crawford and Vladan Joler</a>
                </span>
                <h2 className="text-xl font-bold">Instructions</h2>
                <ul className="list-disc ml-5 mb-4">
                  <li>Use your mouse to click the images that contain the object stated at the top of the next page.</li>
                  <li>You can unselect a box by pressing it again, after it is selected.</li>
                  <li>If none of the objects stated at the top of the page are in any of the images, then just press the next button and select no boxes.</li>
                  <li>You will be timed per task.</li>
                </ul>
            </div>
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
