"use client";

import { useEffect, useState } from "react";
import {
  type SelectAllSquaresAsset,
  selectAllSquaresAssets,
} from "@/app/components/minigames/captcha/assets/select-all-squares";
import {
  type SelectImagesAsset,
  selectImagesAssets,
} from "@/app/components/minigames/captcha/assets/select-images";
import { basePath } from "@/lib/base-path";
import { CaptchaIteration, CaptchaMode, captchaModeToColumns, generateCaptchaIterations } from "@/app/components/minigames/captcha/utils/captcha-utils";


export default function Captcha() {
  const maxIterations: number = 3;

	const [captchaIterations, setCaptchaIterations] = useState<CaptchaIteration[] | null>(null);
  const [currIteration, setCurrIteration] = useState<number>(0);

  useEffect(() => {
    const newCaptchaIterations = generateCaptchaIterations(maxIterations);
    setCaptchaIterations(newCaptchaIterations);
  }, [maxIterations]);

  // still not ready to render
  if (!captchaIterations) return null; 

  const currMode: CaptchaMode = captchaIterations[currIteration].mode;

	const columns: number = captchaModeToColumns(currMode);
  const rows: number = captchaModeToColumns(currMode);

  console.log(captchaIterations);

  return (
    <div className="w-full bg-white p-1 rounded-xl">
      <div>Hello</div>

      {currMode === CaptchaMode.SELECT_ALL_SQUARES && (
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
              <div
                key={index}
                className={`bg-no-repeat bg-cover hover:scale-80 transition-all m-0.5 ${x === 0 && y === 0 ? "rounded-tl-xl" : undefined} ${x === 0 && y === rows - 1 ? "rounded-bl-xl" : undefined} ${x === columns - 1 && y === rows - 1 ? "rounded-br-xl" : undefined} ${x === columns - 1 && y === 0 ? "rounded-tr-xl" : undefined}`}
                style={{
                  backgroundImage: `url(${(captchaIterations[currIteration].assets as SelectAllSquaresAsset).imagePath})`,
                  backgroundSize: `${columns * 100}% ${rows * 100}%`,
                  backgroundPosition: `${(x / (columns - 1)) * 100}% ${(y / (rows - 1)) * 100}%`,
                }}
              />
            );
          })}
        </div>
      )}

			{currMode === CaptchaMode.SELECT_IMAGES && (
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
              <div
                key={index}
                className={`bg-no-repeat bg-cover hover:scale-80 transition-all m-0.5 ${x === 0 && y === 0 ? "rounded-tl-xl" : undefined} ${x === 0 && y === rows - 1 ? "rounded-bl-xl" : undefined} ${x === columns - 1 && y === rows - 1 ? "rounded-br-xl" : undefined} ${x === columns - 1 && y === 0 ? "rounded-tr-xl" : undefined}`}
                style={{
                  backgroundImage: `url(${basePath}/images/cat.jpg)`,
                  backgroundSize: `${columns * 100}% ${rows * 100}%`,
                  backgroundPosition: `${(x / (columns - 1)) * 100}% ${(y / (rows - 1)) * 100}%`,
                }}
              />
            );
          })}
        </div>
      )}

      <button>next</button>
    </div>
  );
}
