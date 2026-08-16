import { basePath } from "@/lib/base-path";

// solutions is just a 4x4 grid of trues and falses and the max score is 16
export type SelectAllSquaresAsset = {
  imagePath: string;
  objectToIdentify: string;
  solutions: boolean[][];
};

export const selectAllSquaresAssets: SelectAllSquaresAsset[] = [
  {
    imagePath: `${basePath}/images/cat.jpg`,
    objectToIdentify: "cat",
    solutions: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  },
  {
    imagePath: `${basePath}/images/cat.jpg`,
    objectToIdentify: "cat",
    solutions: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  },
  {
    imagePath: `${basePath}/images/cat.jpg`,
    objectToIdentify: "cat",
    solutions: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  },
];
