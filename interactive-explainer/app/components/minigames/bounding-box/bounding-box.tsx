"use client";

import { useActorRef } from "@xstate/react";
import Image from "next/image";
import { type PointerEvent, useRef, useState } from "react";
import {
  GameManager,
  GameManagerTransitions,
} from "@/app/game/state/game-manager";
import type { MinigameStats } from "@/app/game/types/minigame-stats";
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
  const boundingBoxAssetsRef = useRef<BoundingBoxAsset[]>(
    boundingBoxAssets.sort(() => Math.random() - 0.5).slice(0, maxIterations),
  );
  const [currIteration, setCurrIteration] = useState<number>(0);
  const [currBoundingBoxes, setcurrBoundingBoxes] = useState<BoundingBoxData[]>(
    [],
  );
  const [draftBox, setDraftBox] = useState<DraftBox | null>(null);
  const [isTutorialVisible, setIsTutorialVisible] = useState<boolean>(true);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const currAsset: BoundingBoxAsset =
    boundingBoxAssetsRef.current[currIteration];

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
      <div className="text-white">{(elapsedMS / 1000).toFixed(0)}</div>
      <div className="w-full bg-white p-1 rounded-xl">
        <div
          ref={imageContainerRef}
          className="relative w-full aspect-square cursor-crosshair"
          onPointerDown={handleContainerPointerDown}
        >
          <Image
            src={currAsset.imagePath}
            alt=""
            fill
            className="object-contain pointer-events-none"
          />

          {draftBox && (
            <div
              className="absolute border-2 border-dashed border-(--highlight-colour) -translate-x-1/2 -translate-y-1/2 pointer-events-none"
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
              className="absolute border-2 border-(--highlight-colour) -translate-x-1/2 -translate-y-1/2 cursor-pointer"
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
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full cursor-pointer text-xs"
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
