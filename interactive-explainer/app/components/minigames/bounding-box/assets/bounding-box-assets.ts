import { basePath } from "@/lib/base-path";
import type { BoundingBoxData } from "../utils/bounding-box-utils";

export type BoundingBoxAsset = {
  imagePath: string;
  solutions: BoundingBoxData[];
};

export const boundingBoxLabels: string[] = [
  "building",
  "sign",
  "brick-building",
  "street-lamp",
  "fire-hydrant",
  "car",
  "pedestrians",
  "one-way-sign",
  "crosswalk",
  "tree",
  "traffic-light",
  "do-not-enter-sign",
  "utility-pole",
  "bushes",
  "trailer",
  "canopy",
  "pillar",
  "gas-pump",
  "bridge",
  "shipping-container",
  "traffic-cone",
  // red herrings - not present in any asset image, just extra decoy options
  // in the label dropdown
  "mailbox",
  "bicycle",
  "bus-stop",
  "dog",
  "fountain",
  "bench",
  "truck",
  "van",
  "clown",
];

export const boundingBoxAssets: BoundingBoxAsset[] = [
  {
    imagePath: `${basePath}/images/bounding_box_1.png`,
    solutions: [
      { label: "building", x: 15, y: 44, width: 30, height: 22 },
      { label: "sign", x: 59, y: 50, width: 18, height: 25 },
      { label: "brick-building", x: 85, y: 48, width: 30, height: 20 },
      { label: "street-lamp", x: 95, y: 48, width: 5, height: 55 },
      { label: "fire-hydrant", x: 30, y: 63, width: 5, height: 10 },
      { label: "car", x: 15, y: 79, width: 14, height: 18 },
      { label: "pedestrians", x: 82, y: 86, width: 13, height: 21 },
      { label: "one-way-sign", x: 92, y: 65, width: 9, height: 10 },
    ],
  },
  {
    imagePath: `${basePath}/images/bounding_box_2.png`,
    solutions: [
      { label: "traffic-light", x: 7, y: 38, width: 14, height: 75 },
      { label: "car", x: 6, y: 53, width: 12, height: 10 },
      { label: "car", x: 30, y: 54, width: 16, height: 12 },
      { label: "car", x: 45, y: 54, width: 14, height: 13 },
      { label: "car", x: 62, y: 56, width: 16, height: 12 },
      { label: "car", x: 79, y: 56, width: 18, height: 12 },
      { label: "building", x: 62, y: 37, width: 20, height: 30 },
      { label: "tree", x: 86, y: 33, width: 24, height: 37 },
      { label: "crosswalk", x: 50, y: 82, width: 84, height: 35 },
      { label: "pedestrians", x: 13, y: 61, width: 14, height: 22 },
      { label: "street-lamp", x: 91, y: 41, width: 7, height: 58 },
    ],
  },
  {
    imagePath: `${basePath}/images/bounding_box_3.png`,
    solutions: [
      { label: "do-not-enter-sign", x: 84, y: 44, width: 12, height: 17 },
      { label: "utility-pole", x: 76, y: 30, width: 7, height: 50 },
      { label: "tree", x: 15, y: 22, width: 30, height: 45 },
      { label: "bushes", x: 45, y: 50, width: 40, height: 16 },
      { label: "car", x: 45, y: 43, width: 14, height: 6 },
      { label: "car", x: 94, y: 46, width: 12, height: 12 },
      { label: "sign", x: 82, y: 72, width: 15, height: 19 },
    ],
  },
  {
    imagePath: `${basePath}/images/bounding_box_4.png`,
    solutions: [
      { label: "traffic-light", x: 58, y: 52, width: 60, height: 32 },
      { label: "street-lamp", x: 68, y: 47, width: 8, height: 42 },
      { label: "tree", x: 44, y: 60, width: 28, height: 31 },
      { label: "tree", x: 85, y: 40, width: 10, height: 45 },
      { label: "sign", x: 63, y: 48, width: 8, height: 4 },
      { label: "sign", x: 97, y: 63, width: 6, height: 8 },
      { label: "building", x: 90, y: 52, width: 16, height: 14 },
      { label: "bushes", x: 80, y: 70, width: 25, height: 12 },
      { label: "car", x: 6, y: 93, width: 12, height: 14 },
      { label: "car", x: 53, y: 68, width: 12, height: 12 },
      { label: "car", x: 17, y: 63, width: 18, height: 8 },
      { label: "trailer", x: 3, y: 68, width: 8, height: 20 },
    ],
  },
  {
    imagePath: `${basePath}/images/bounding_box_5.png`,
    solutions: [
      { label: "canopy", x: 50, y: 25, width: 100, height: 30 },
      { label: "pillar", x: 29, y: 50, width: 8, height: 27 },
      { label: "pillar", x: 57, y: 48, width: 8, height: 28 },
      { label: "gas-pump", x: 42, y: 55, width: 8, height: 20 },
      { label: "gas-pump", x: 71, y: 53, width: 8, height: 20 },
      { label: "gas-pump", x: 90, y: 53, width: 8, height: 20 },
      { label: "building", x: 55, y: 32, width: 100, height: 18 },
      { label: "tree", x: 13, y: 55, width: 22, height: 45 },
      { label: "car", x: 35, y: 50, width: 12, height: 10 },
      { label: "car", x: 6, y: 45, width: 12, height: 10 },
      { label: "car", x: 90, y: 97, width: 22, height: 8 },
      { label: "sign", x: 62, y: 57, width: 4, height: 20 },
    ],
  },
  {
    imagePath: `${basePath}/images/bounding_box_6.png`,
    solutions: [
      { label: "bridge", x: 50, y: 33, width: 100, height: 17 },
      { label: "shipping-container", x: 27, y: 48, width: 55, height: 20 },
      { label: "traffic-cone", x: 10, y: 68, width: 20, height: 15 },
      { label: "traffic-cone", x: 80, y: 62, width: 25, height: 20 },
      { label: "car", x: 15, y: 58, width: 18, height: 13 },
      { label: "tree", x: 75, y: 30, width: 25, height: 30 },
      { label: "utility-pole", x: 68, y: 25, width: 4, height: 45 },
      { label: "utility-pole", x: 82, y: 20, width: 3, height: 45 },
      { label: "street-lamp", x: 15, y: 20, width: 4, height: 45 },
      { label: "car", x: 10, y: 25, width: 15, height: 8 },
      { label: "car", x: 97, y: 65, width: 8, height: 25 },
    ],
  },
];
