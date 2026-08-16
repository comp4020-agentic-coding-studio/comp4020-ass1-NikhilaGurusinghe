import { basePath } from "@/lib/base-path";
import { BoundingBoxData } from "../utils/bounding-box-utils";

export type BoundingBoxAsset = {
    imagePath: string;
    solutions: BoundingBoxData[];
};

export const boundingBoxLabels: string[] = [
  "cat1",
  "cat2",
  "cat3",
  "octopus"
]

export const boundingBoxAssets: BoundingBoxAsset[] = [
  {
    imagePath: `${basePath}/images/cat.jpg`,
    solutions: [{ label: "cat1", x: 40, y: 30 }]
  },
  {
    imagePath: `${basePath}/images/cat.jpg`,
    solutions: [{ label: "cat2", x: 40, y: 30 }]
  },
  {
    imagePath: `${basePath}/images/cat.jpg`,
    solutions: [{ label: "cat3", x: 40, y: 30 }]
  }
]