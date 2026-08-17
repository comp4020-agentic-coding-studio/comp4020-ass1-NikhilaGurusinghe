// solutions is just a 3x3 grid of trues and falses and the max score is 9

import { basePath } from "@/lib/base-path";

// imagePaths is going to have 3x3 images
export type SelectImagesAsset = {
  imagePaths: string[][];
  objectToIdentify: string;
  solutions: boolean[][];
};

export const selectImagesAssets: SelectImagesAsset[] = [
  {
    imagePaths: [
      [
        `${basePath}/images/select_images_1_1.png`,
        `${basePath}/images/select_images_1_2.png`,
        `${basePath}/images/select_images_1_3.png`,
      ],
      [
        `${basePath}/images/select_images_1_4.png`,
        `${basePath}/images/select_images_1_5.png`,
        `${basePath}/images/select_images_1_6.png`,
      ],
      [
        `${basePath}/images/select_images_1_7.png`,
        `${basePath}/images/select_images_1_8.png`,
        `${basePath}/images/select_images_1_9.png`,
      ],
    ],
    objectToIdentify: "trucks",
    solutions: [
      [false, false, false],
      [false, false, false],
      [true, true, true],
    ],
  },
  {
    imagePaths: [
      [
        `${basePath}/images/select_images_2_1.png`,
        `${basePath}/images/select_images_2_2.png`,
        `${basePath}/images/select_images_2_3.png`,
      ],
      [
        `${basePath}/images/select_images_2_4.png`,
        `${basePath}/images/select_images_2_5.png`,
        `${basePath}/images/select_images_2_6.png`,
      ],
      [
        `${basePath}/images/select_images_2_7.png`,
        `${basePath}/images/select_images_2_8.png`,
        `${basePath}/images/select_images_2_9.png`,
      ],
    ],
    objectToIdentify: "cars",
    solutions: [
      [false, true, true],
      [false, false, false],
      [false, false, true],
    ],
  },
  {
    imagePaths: [
      [
        `${basePath}/images/select_images_3_1.png`,
        `${basePath}/images/select_images_3_2.png`,
        `${basePath}/images/select_images_3_3.png`,
      ],
      [
        `${basePath}/images/select_images_3_4.png`,
        `${basePath}/images/select_images_3_5.png`,
        `${basePath}/images/select_images_3_6.png`,
      ],
      [
        `${basePath}/images/select_images_3_7.png`,
        `${basePath}/images/select_images_3_8.png`,
        `${basePath}/images/select_images_3_9.png`,
      ],
    ],
    objectToIdentify: "vans",
    solutions: [
      [false, false, true],
      [false, false, true],
      [true, false, false],
    ],
  },
  {
    imagePaths: [
      [
        `${basePath}/images/select_images_4_1.png`,
        `${basePath}/images/select_images_4_2.png`,
        `${basePath}/images/select_images_4_3.png`,
      ],
      [
        `${basePath}/images/select_images_4_4.png`,
        `${basePath}/images/select_images_4_5.png`,
        `${basePath}/images/select_images_4_6.png`,
      ],
      [
        `${basePath}/images/select_images_4_7.png`,
        `${basePath}/images/select_images_4_8.png`,
        `${basePath}/images/select_images_4_9.png`,
      ],
    ],
    objectToIdentify: "sedans",
    solutions: [
      [false, false, false],
      [false, false, false],
      [true, true, true],
    ],
  },
  {
    imagePaths: [
      [
        `${basePath}/images/select_images_5_1.png`,
        `${basePath}/images/select_images_5_2.png`,
        `${basePath}/images/select_images_5_3.png`,
      ],
      [
        `${basePath}/images/select_images_5_4.png`,
        `${basePath}/images/select_images_5_5.png`,
        `${basePath}/images/select_images_5_6.png`,
      ],
      [
        `${basePath}/images/select_images_5_7.png`,
        `${basePath}/images/select_images_5_8.png`,
        `${basePath}/images/select_images_5_9.png`,
      ],
    ],
    objectToIdentify: "cars",
    solutions: [
      [true, true, true],
      [false, true, false],
      [false, false, false],
    ],
  },
];
