export type BoundingBoxData = {
    label: string,
    x: number,
    y: number,
    width?: number,
    height?: number,
}

export type BoundingBoxEdge = "n" | "s" | "e" | "w";
export type BoundingBoxCorner = "nw" | "ne" | "sw" | "se";

const CORNER_TO_EDGES: Record<BoundingBoxCorner, [BoundingBoxEdge, BoundingBoxEdge]> = {
  nw: ["n", "w"],
  ne: ["n", "e"],
  sw: ["s", "w"],
  se: ["s", "e"],
};

// x/y are the box's centre as a percentage of the image container, so
// resizing from one edge has to recompute both the size and the centre
// while keeping the opposite edge fixed in place.
function resizeBoundingBoxEdge(
  box: BoundingBoxData,
  edge: BoundingBoxEdge,
  pointerXPercent: number,
  pointerYPercent: number,
  minSizePercent: number,
): BoundingBoxData {
  const width: number = box.width ?? 0;
  const height: number = box.height ?? 0;
  const left: number = box.x - width / 2;
  const right: number = box.x + width / 2;
  const top: number = box.y - height / 2;
  const bottom: number = box.y + height / 2;

  if (edge === "e") {
    const newRight: number = Math.max(pointerXPercent, left + minSizePercent);
    return { ...box, x: (left + newRight) / 2, width: newRight - left };
  }
  if (edge === "w") {
    const newLeft: number = Math.min(pointerXPercent, right - minSizePercent);
    return { ...box, x: (newLeft + right) / 2, width: right - newLeft };
  }
  if (edge === "s") {
    const newBottom: number = Math.max(pointerYPercent, top + minSizePercent);
    return { ...box, y: (top + newBottom) / 2, height: newBottom - top };
  }

  // edge === "n"
  const newTop: number = Math.min(pointerYPercent, bottom - minSizePercent);
  return { ...box, y: (newTop + bottom) / 2, height: bottom - newTop };
}

// a corner drag just resizes its vertical edge and horizontal edge in turn -
// each only ever touches its own axis, so applying them one after the other
// is equivalent to resizing both at once
export function resizeBoundingBox(
  box: BoundingBoxData,
  edge: BoundingBoxEdge | BoundingBoxCorner,
  pointerXPercent: number,
  pointerYPercent: number,
  minSizePercent: number = 4,
): BoundingBoxData {
  if (edge === "n" || edge === "s" || edge === "e" || edge === "w") {
    return resizeBoundingBoxEdge(
      box,
      edge,
      pointerXPercent,
      pointerYPercent,
      minSizePercent,
    );
  }

  const [verticalEdge, horizontalEdge] = CORNER_TO_EDGES[edge];
  const afterVertical: BoundingBoxData = resizeBoundingBoxEdge(
    box,
    verticalEdge,
    pointerXPercent,
    pointerYPercent,
    minSizePercent,
  );
  return resizeBoundingBoxEdge(
    afterVertical,
    horizontalEdge,
    pointerXPercent,
    pointerYPercent,
    minSizePercent,
  );
}

// centres more than this far apart (in percent of the image) score 0 for that solution
const MAX_CENTRE_DISTANCE_PERCENT: number = 30;

function centreDistancePercent(a: BoundingBoxData, b: BoundingBoxData): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// each solution is matched against the user's boxes sharing its label (the
// closest one, if there's more than one), and scored by how close its centre
// is to the solution's centre - a box with no matching label scores 0
export function calculateBoundingBoxAccuracy(
  solutions: BoundingBoxData[],
  userBoxes: BoundingBoxData[],
): number {
  if (solutions.length === 0) return 1;

  const scores: number[] = solutions.map((solution: BoundingBoxData) => {
    const matchingBoxes: BoundingBoxData[] = userBoxes.filter(
      (box: BoundingBoxData) => box.label === solution.label,
    );
    if (matchingBoxes.length === 0) return 0;

    const closestDistance: number = Math.min(
      ...matchingBoxes.map((box: BoundingBoxData) =>
        centreDistancePercent(box, solution),
      ),
    );

    return Math.max(0, 1 - closestDistance / MAX_CENTRE_DISTANCE_PERCENT);
  });

  return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
}
