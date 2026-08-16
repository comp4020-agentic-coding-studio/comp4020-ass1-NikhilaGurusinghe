// solutions is just a 3x3 grid of trues and falses and the max score is 9

import { basePath } from "@/lib/base-path";

// imagePaths is going to have 3x3 images
export type SelectImagesAsset = {
  imagePaths: string[][];
  solutions: boolean[][];
};

export const selectImagesAssets: SelectImagesAsset[] = [
  {
    imagePaths: [
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
    ],
    solutions: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    imagePaths: [
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
    ],
    solutions: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
  },
  {
    imagePaths: [
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
      [
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
        `${basePath}/images/cat.jpg`,
      ],
    ],
    solutions: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
  },
];
