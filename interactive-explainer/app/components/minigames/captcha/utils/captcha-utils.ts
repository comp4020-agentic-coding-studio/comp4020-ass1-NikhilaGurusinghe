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

  for (let index = 0; index < maxIterations; index++) {
    const allCaptchaMode: CaptchaMode[] = Object.values(CaptchaMode).filter(
      (value) => typeof value === "number",
    ) as CaptchaMode[];
    const randomCaptchaMode: CaptchaMode =
      allCaptchaMode[Math.floor(Math.random() * allCaptchaMode.length)];

    // TODO this "as" conversion could be a problem, but im just assuming its good cause i
    // manually setup all the arrays for each enum val
    const seenIndicies: Set<number> = allSeenAssetIndices.get(
      randomCaptchaMode,
    ) as Set<number>;

    let assetList: SelectAllSquaresAsset[] | SelectImagesAsset[] = [];
    if (randomCaptchaMode === CaptchaMode.SELECT_ALL_SQUARES) {
      assetList = selectAllSquaresAssets;
    } else if (randomCaptchaMode === CaptchaMode.SELECT_IMAGES) {
      assetList = selectImagesAssets;
    } else {
      console.error("Captcha component: invalid generated randomCaptchaMode");
    }

    // just the indices that are available according to the size of selectAllSquaresAssets
    const availableIndices = assetList
      .map((_, index: number) => index)
      .filter((index: number) => !seenIndicies.has(index));

    if (availableIndices.length === 0) {
      console.error("Captcha component: no unused assets left");
    }

    const randomAssetIndex: number =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];

    returnMe.push({
      mode: randomCaptchaMode,
      assets: assetList[randomAssetIndex],
    });
  }

  return returnMe;
}
