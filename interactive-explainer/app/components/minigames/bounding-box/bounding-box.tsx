"use client";

import Image from "next/image";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { GameManagerTransitions } from "@/app/game/state/game-manager";
import { GameManagerContext } from "@/app/game/state/game-manager-context";
import type { MinigameStats } from "@/app/game/types/minigame-stats";
import { calculateTaskSalary } from "@/app/game/utils/salary-utils";
import { formatTimer } from "@/lib/format-timer";
import {
  type BoundingBoxAsset,
  boundingBoxAssets,
  boundingBoxLabels,
} from "./assets/bounding-box-assets";
import {
  type BoundingBoxCorner,
  type BoundingBoxData,
  type BoundingBoxEdge,
  calculateBoundingBoxAccuracy,
  resizeBoundingBox,
} from "./utils/bounding-box-utils";

const DEFAULT_BOX_WIDTH_PERCENT: number = 16;
const DEFAULT_BOX_HEIGHT_PERCENT: number = 16;
// a drag shorter than this in both axes is treated as a plain click, and
// falls back to a default-size box centred on the click point
const MIN_DRAG_SIZE_PERCENT: number = 3;

type DraftBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function cornersToBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): DraftBox {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export default function BoundingBox() {
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
  const boundingBoxAssetsRef = useRef<BoundingBoxAsset[]>(
    boundingBoxAssets.sort(() => Math.random() - 0.5).slice(0, maxIterations),
  );
  const [currIteration, setCurrIteration] = useState<number>(0);
  const [currBoundingBoxes, setcurrBoundingBoxes] = useState<BoundingBoxData[]>(
    [],
  );
  const [draftBox, setDraftBox] = useState<DraftBox | null>(null);
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
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const currAsset: BoundingBoxAsset =
    boundingBoxAssetsRef.current[currIteration];

  // drives the container's aspect-ratio below, so it always matches the
  // image's own shape exactly and object-contain never has to letterbox it -
  // otherwise a click's percent-of-container position wouldn't line up with
  // percent-of-image, which is the space solutions are authored in. Reset
  // when the asset changes so a new image doesn't briefly render at the
  // previous one's ratio before its own onLoad fires.
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    setNaturalSize(null);
  }, [currAsset.imagePath]);

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>): void {
    const img: HTMLImageElement = event.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  }

  // accumulated across the whole game (not reset on re-render), so the final
  // aggregate at the last iteration averages over all iterations, not just one
  const subMinigameStatsRef = useRef<MinigameStats[]>([]);

  // click-and-drag on empty space draws a new box between the mouseDown and
  // mouseUp points; a live dashed preview follows the drag via pointer capture
  function handleContainerPointerDown(
    event: PointerEvent<HTMLDivElement>,
  ): void {
    const container: HTMLDivElement = event.currentTarget;
    container.setPointerCapture(event.pointerId);

    const rect: DOMRect = container.getBoundingClientRect();
    const startXPercent: number = clampPercent(
      ((event.clientX - rect.left) / rect.width) * 100,
    );
    const startYPercent: number = clampPercent(
      ((event.clientY - rect.top) / rect.height) * 100,
    );

    setDraftBox(
      cornersToBox(startXPercent, startYPercent, startXPercent, startYPercent),
    );

    function handlePointerMove(moveEvent: globalThis.PointerEvent): void {
      const xPercent: number = clampPercent(
        ((moveEvent.clientX - rect.left) / rect.width) * 100,
      );
      const yPercent: number = clampPercent(
        ((moveEvent.clientY - rect.top) / rect.height) * 100,
      );

      setDraftBox(
        cornersToBox(startXPercent, startYPercent, xPercent, yPercent),
      );
    }

    function handlePointerUp(upEvent: globalThis.PointerEvent): void {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);

      const endXPercent: number = clampPercent(
        ((upEvent.clientX - rect.left) / rect.width) * 100,
      );
      const endYPercent: number = clampPercent(
        ((upEvent.clientY - rect.top) / rect.height) * 100,
      );
      const drawn: DraftBox = cornersToBox(
        startXPercent,
        startYPercent,
        endXPercent,
        endYPercent,
      );

      setDraftBox(null);

      const isPlainClick: boolean =
        drawn.width < MIN_DRAG_SIZE_PERCENT &&
        drawn.height < MIN_DRAG_SIZE_PERCENT;

      // a plain click falls back to a default-size box centred on the click
      // point, so that centre needs pulling in from the edges far enough
      // that the default size doesn't spill outside the container
      const x: number = isPlainClick
        ? Math.min(
            100 - DEFAULT_BOX_WIDTH_PERCENT / 2,
            Math.max(DEFAULT_BOX_WIDTH_PERCENT / 2, drawn.x),
          )
        : drawn.x;
      const y: number = isPlainClick
        ? Math.min(
            100 - DEFAULT_BOX_HEIGHT_PERCENT / 2,
            Math.max(DEFAULT_BOX_HEIGHT_PERCENT / 2, drawn.y),
          )
        : drawn.y;

      setcurrBoundingBoxes((prevBoxes: BoundingBoxData[]) => [
        ...prevBoxes,
        {
          label: boundingBoxLabels[0],
          x,
          y,
          width: isPlainClick ? DEFAULT_BOX_WIDTH_PERCENT : drawn.width,
          height: isPlainClick ? DEFAULT_BOX_HEIGHT_PERCENT : drawn.height,
        },
      ]);
    }

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
  }

  function handleBoxLabelChange(index: number, label: string): void {
    setcurrBoundingBoxes((prevBoxes: BoundingBoxData[]) =>
      prevBoxes.map((box: BoundingBoxData, boxIndex: number) =>
        boxIndex === index ? { ...box, label } : box,
      ),
    );
  }

  function handleBoxDelete(index: number): void {
    setcurrBoundingBoxes((prevBoxes: BoundingBoxData[]) =>
      prevBoxes.filter((_, boxIndex: number) => boxIndex !== index),
    );
  }

  // dragging inside a box moves it; pointer capture on the box itself keeps
  // sending move/up events even once the cursor leaves it
  function handleBoxDragStart(
    event: PointerEvent<HTMLDivElement>,
    index: number,
  ): void {
    event.stopPropagation();

    const container: HTMLDivElement | null = imageContainerRef.current;
    const originalBox: BoundingBoxData | undefined = currBoundingBoxes[index];
    if (!container || !originalBox) return;

    const boxElement: HTMLDivElement = event.currentTarget;
    boxElement.setPointerCapture(event.pointerId);

    const rect: DOMRect = container.getBoundingClientRect();
    const startXPercent: number =
      ((event.clientX - rect.left) / rect.width) * 100;
    const startYPercent: number =
      ((event.clientY - rect.top) / rect.height) * 100;
    const originalX: number = originalBox.x;
    const originalY: number = originalBox.y;

    function handlePointerMove(moveEvent: globalThis.PointerEvent): void {
      const xPercent: number =
        ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const yPercent: number =
        ((moveEvent.clientY - rect.top) / rect.height) * 100;
      const deltaX: number = xPercent - startXPercent;
      const deltaY: number = yPercent - startYPercent;

      setcurrBoundingBoxes((prevBoxes: BoundingBoxData[]) =>
        prevBoxes.map((box: BoundingBoxData, boxIndex: number) => {
          if (boxIndex !== index) return box;

          const halfWidth: number =
            (box.width ?? DEFAULT_BOX_WIDTH_PERCENT) / 2;
          const halfHeight: number =
            (box.height ?? DEFAULT_BOX_HEIGHT_PERCENT) / 2;

          return {
            ...box,
            x: Math.min(
              100 - halfWidth,
              Math.max(halfWidth, originalX + deltaX),
            ),
            y: Math.min(
              100 - halfHeight,
              Math.max(halfHeight, originalY + deltaY),
            ),
          };
        }),
      );
    }

    function handlePointerUp(): void {
      boxElement.removeEventListener("pointermove", handlePointerMove);
      boxElement.removeEventListener("pointerup", handlePointerUp);
    }

    boxElement.addEventListener("pointermove", handlePointerMove);
    boxElement.addEventListener("pointerup", handlePointerUp);
  }

  // dragging an edge or corner handle resizes that box, keeping the opposite
  // side(s) fixed; pointer capture on the handle keeps tracking the drag even
  // once the cursor leaves the (small) handle hitbox
  function handleResizeStart(
    event: PointerEvent<HTMLDivElement>,
    index: number,
    edge: BoundingBoxEdge | BoundingBoxCorner,
  ): void {
    event.stopPropagation();

    const container: HTMLDivElement | null = imageContainerRef.current;
    if (!container) return;

    const handleElement: HTMLDivElement = event.currentTarget;
    handleElement.setPointerCapture(event.pointerId);

    function handlePointerMove(moveEvent: globalThis.PointerEvent): void {
      const rect: DOMRect = container!.getBoundingClientRect();
      const xPercent: number = clampPercent(
        ((moveEvent.clientX - rect.left) / rect.width) * 100,
      );
      const yPercent: number = clampPercent(
        ((moveEvent.clientY - rect.top) / rect.height) * 100,
      );

      setcurrBoundingBoxes((prevBoxes: BoundingBoxData[]) =>
        prevBoxes.map((box: BoundingBoxData, boxIndex: number) =>
          boxIndex === index
            ? resizeBoundingBox(box, edge, xPercent, yPercent)
            : box,
        ),
      );
    }

    function handlePointerUp(): void {
      handleElement.removeEventListener("pointermove", handlePointerMove);
      handleElement.removeEventListener("pointerup", handlePointerUp);
    }

    handleElement.addEventListener("pointermove", handlePointerMove);
    handleElement.addEventListener("pointerup", handlePointerUp);
  }

  function handleNextClick(): void {
    // stop timer from previous iteration's next button press or from the tutorial next button
    const elapsedTime: number = stopTimer() ?? 0;

    const accuracy: number = calculateBoundingBoxAccuracy(
      currAsset.solutions,
      currBoundingBoxes,
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

    // updating our iteration counter and clearing the boxes for the next image
    setCurrIteration((prevVal: number) =>
      Math.min(prevVal + 1, maxIterations - 1),
    );
    setcurrBoundingBoxes([]);

    // start timer for next iteration
    startTimer();
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Bound and label all objects in image</h1>
      <span className="text-left">{formatTimer(elapsedMS)} spent on task</span>
      <div className="w-full p-1 flex flex-col gap-4">
        <div
          ref={imageContainerRef}
          className="relative w-full cursor-crosshair rounded-md overflow-hidden"
          style={{
            aspectRatio: naturalSize
              ? `${naturalSize.width} / ${naturalSize.height}`
              : "1",
          }}
          onPointerDown={handleContainerPointerDown}
        >
          <Image
            src={currAsset.imagePath}
            alt=""
            fill
            className="object-contain pointer-events-none"
            onLoad={handleImageLoad}
          />

          {draftBox && (
            <div
              className="absolute border-3 border-dashed border-sky-400 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${draftBox.x}%`,
                top: `${draftBox.y}%`,
                width: `${draftBox.width}%`,
                height: `${draftBox.height}%`,
              }}
            />
          )}

          {currBoundingBoxes.map((box: BoundingBoxData, index: number) => (
            <div
              key={index}
              onPointerDown={(event) => handleBoxDragStart(event, index)}
              className="absolute border-3 rounded-md border-sky-400 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width ?? DEFAULT_BOX_WIDTH_PERCENT}%`,
                height: `${box.height ?? DEFAULT_BOX_HEIGHT_PERCENT}%`,
              }}
            >
              <select
                value={box.label}
                onPointerDown={(event) => event.stopPropagation()}
                onChange={(event) =>
                  handleBoxLabelChange(index, event.target.value)
                }
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full cursor-pointer bg-white rounded-md"
              >
                {boundingBoxLabels.map((label: string) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => handleBoxDelete(index)}
                className="absolute drop-shadow-md/50 bg-(--highlight-colour) rounded-full w-6 h-6 flex items-center justify-center leading-none top-0 left-0 -translate-x-5/8 -translate-y-5/8 cursor-pointer text-white"
              >
                &times;
              </button>

              {/* edge resize handles */}
              <div
                onPointerDown={(event) => handleResizeStart(event, index, "n")}
                className="absolute top-0 left-2 right-2 h-2 -translate-y-1/2 cursor-ns-resize"
              />
              <div
                onPointerDown={(event) => handleResizeStart(event, index, "s")}
                className="absolute bottom-0 left-2 right-2 h-2 translate-y-1/2 cursor-ns-resize"
              />
              <div
                onPointerDown={(event) => handleResizeStart(event, index, "w")}
                className="absolute left-0 top-2 bottom-2 w-2 -translate-x-1/2 cursor-ew-resize"
              />
              <div
                onPointerDown={(event) => handleResizeStart(event, index, "e")}
                className="absolute right-0 top-2 bottom-2 w-2 translate-x-1/2 cursor-ew-resize"
              />

              {/* corner resize handles */}
              <div
                onPointerDown={(event) => handleResizeStart(event, index, "ne")}
                className="absolute top-0 right-0 w-3 h-3 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
              />
              <div
                onPointerDown={(event) => handleResizeStart(event, index, "sw")}
                className="absolute bottom-0 left-0 w-3 h-3 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
              />
              <div
                onPointerDown={(event) => handleResizeStart(event, index, "se")}
                className="absolute bottom-0 right-0 w-3 h-3 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
              />
            </div>
          ))}
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
              <h1 className="text-2xl font-bold mb-2">Bounding Boxes</h1>
            
            <div className="w-full min-h-0 overflow-y-auto flex flex-col items-center sm:items-start mb-4">
              <span className="border-l-2 pl-2 ml-2 my-3">
                <p>“The company they work for is called Sama and is a subcontractor to Meta. Here in Kenya’s capital, thousands of people train AI systems, teaching them to recognise and interpret the world.</p>
                <p>They are called data annotators, and they are the manual labourers of the AI revolution. On the screens they draw boxes around flower pots and traffic signs, follow contours, register pixels and name objects: cars, lamps, people. Every image must be described, labelled and quality assured.</p>
                <p>All to make the next generation of [Meta] smart glasses a little more intelligent – a little more human.</p>
                <p>...</p>
                <p>The employees have signed extensive confidentiality agreements – if they break them they can lose their jobs – and be thrown back into a life without income, often to the slums.</p>
                <p>...</p>
                <p>The workers in Kenya say that it feels uncomfortable to go to work. They tell us about deeply private video clips, which appear to come straight out of Western homes, from people who use the glasses in their everyday lives.”</p>
                <br></br>
                <a className="font-bold italic underline" href="https://www.svd.se/a/K8nrV4/metas-ai-smart-glasses-and-data-privacy-concerns-workers-say-we-see-everything">From She Came Out of the Bathroom Naked, Employee Says - Svenska Dagbladet</a>
                </span>
                <h2 className="text-xl font-bold">Instructions</h2>
                <ul className="list-disc ml-5 mb-4">
                  <li>Use your mouse to drag and draw bounding boxes around any object of interest, and label it, using the drop-down menu, with the closest possible label.</li>
                  <li>You can click and drag the centres of bounding boxes, as well as clicking the cross at the top right corner to remove a box.</li>
                  <li>It is okay to overlap bounding boxes.</li>
                  <li>Try and capture the entirety of the object within the bounding box.</li>
                  <li>If there are no objects of interest, then just press the next button and draw no bounding boxes.</li>
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
