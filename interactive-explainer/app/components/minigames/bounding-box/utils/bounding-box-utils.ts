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
