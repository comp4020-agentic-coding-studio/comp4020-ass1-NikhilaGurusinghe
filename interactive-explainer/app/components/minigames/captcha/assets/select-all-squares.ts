import { basePath } from "@/lib/base-path";

// solutions is just a 4x4 grid of trues and falses and the max score is 16
export type SelectAllSquaresAsset = {
  imagePath: string;
  objectToIdentify: string;
  solutions: boolean[][];
};

export const selectAllSquaresAssets: SelectAllSquaresAsset[] = [
  {
    imagePath: `${basePath}/images/select_all_squares_1.png`,
    objectToIdentify: "traffic lights",
    solutions: [
      [true, true, false, false],
      [false, false, false, true],
      [false, false, false, true],
      [false, false, false, false],
    ],
  },
  {
    imagePath: `${basePath}/images/select_all_squares_2.png`,
    objectToIdentify: "road signage",
    solutions: [
      [false, true, false, false],
      [true, true, true, false],
      [false, true, true, false],
      [false, false, false, false],
    ],
  },
  {
    imagePath: `${basePath}/images/select_all_squares_3.png`,
    objectToIdentify: "traffic lights",
    solutions: [
      [false, false, false, true],
      [true, false, false, false],
      [true, false, false, false],
      [false, false, false, false],
    ],
  },
  {
    imagePath: `${basePath}/images/select_all_squares_4.png`,
    objectToIdentify: "traffic lights",
    solutions: [
      [false, false, false, false],
      [true, false, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
  },
  {
    imagePath: `${basePath}/images/select_all_squares_5.png`,
    objectToIdentify: "road signage",
    solutions: [
      [false, false, false, false],
      [true, true, false, false],
      [true, true, true, true],
      [false, false, false, false],
    ],
  },
  {
    imagePath: `${basePath}/images/select_all_squares_6.png`,
    objectToIdentify: "speed signs",
    solutions: [
      [false, false, false, false],
      [true, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
    ],
  },
];
