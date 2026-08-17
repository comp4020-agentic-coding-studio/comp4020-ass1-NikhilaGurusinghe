import {
  type SelectAllSquaresAsset,
  selectAllSquaresAssets,
} from "../assets/select-all-squares";
import {
  type SelectImagesAsset,
  selectImagesAssets,
} from "../assets/select-images";

export type CaptchaIteration = {
  mode: CaptchaMode;
  assets: SelectAllSquaresAsset | SelectImagesAsset;
};

export enum CaptchaMode {
  SELECT_IMAGES,
  SELECT_ALL_SQUARES,
}

export function captchaModeToColumns(mode: CaptchaMode): number {
  if (mode === CaptchaMode.SELECT_ALL_SQUARES) {
    return 4;
  } else if (mode === CaptchaMode.SELECT_IMAGES) {
    return 3;
  }

  return 4; // default number of columns
}

export function initBooleanGrid(rows: number, columns: number): boolean[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => false),
  );
}

// this essentially just randomly generates a list of length maxIterations that
// specifies all the images and solutions for each round of the captcha minigame
export function generateCaptchaIterations(maxIterations: number) {
  const allSeenAssetIndices: Map<CaptchaMode, Set<number>> = new Map<
    CaptchaMode,
    Set<number>
  >();
  allSeenAssetIndices.set(CaptchaMode.SELECT_ALL_SQUARES, new Set<number>());
  allSeenAssetIndices.set(CaptchaMode.SELECT_IMAGES, new Set<number>());
  const returnMe: CaptchaIteration[] = [];

  function assetListForMode(
    mode: CaptchaMode,
  ): SelectAllSquaresAsset[] | SelectImagesAsset[] {
    if (mode === CaptchaMode.SELECT_ALL_SQUARES) return selectAllSquaresAssets;
    if (mode === CaptchaMode.SELECT_IMAGES) return selectImagesAssets;

    console.error("Captcha component: invalid generated randomCaptchaMode");
    return [];
  }

  for (let index = 0; index < maxIterations; index++) {
    // only offer modes that still have an unseen asset, so a mode with a
    // small pool (e.g. select-images) can't get picked more times than it
    // has distinct assets to give out
    const allCaptchaMode: CaptchaMode[] = (
      Object.values(CaptchaMode).filter(
        (value) => typeof value === "number",
      ) as CaptchaMode[]
    ).filter((mode: CaptchaMode) => {
      const seen: Set<number> = allSeenAssetIndices.get(mode) as Set<number>;
      return assetListForMode(mode).length > seen.size;
    });

    if (allCaptchaMode.length === 0) {
      console.error("Captcha component: no unused assets left in any mode");
      break;
    }

    const randomCaptchaMode: CaptchaMode =
      allCaptchaMode[Math.floor(Math.random() * allCaptchaMode.length)];

    const seenIndicies: Set<number> = allSeenAssetIndices.get(
      randomCaptchaMode,
    ) as Set<number>;
    const assetList = assetListForMode(randomCaptchaMode);

    // just the indices that are available according to the size of selectAllSquaresAssets
    const availableIndices = assetList
      .map((_, index: number) => index)
      .filter((index: number) => !seenIndicies.has(index));

    const randomAssetIndex: number =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    seenIndicies.add(randomAssetIndex);

    returnMe.push({
      mode: randomCaptchaMode,
      assets: assetList[randomAssetIndex],
    });
  }

  return returnMe;
}
