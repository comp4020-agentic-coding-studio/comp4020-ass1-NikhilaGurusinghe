export type ToneSpectrum = {
  key: string;
  lowLabel: string;
  highLabel: string;
};

// fixed for every iteration - only the conversation and the solution change
export const TONE_SPECTRUMS: ToneSpectrum[] = [
  { key: "tone", lowLabel: "flat", highLabel: "natural" },
  { key: "impact", lowLabel: "affected", highLabel: "annoying" },
  { key: "outcome", lowLabel: "failure", highLabel: "success" },
];

export const TONE_RATING_SCALE_MIN: number = 1;
export const TONE_RATING_SCALE_MAX: number = 5;

export type ToneRatingSelections = Record<string, number | null>;

export function initToneRatingSelections(): ToneRatingSelections {
  return Object.fromEntries(
    TONE_SPECTRUMS.map((spectrum: ToneSpectrum) => [spectrum.key, null]),
  );
}

// each spectrum is scored by how close the user's pick is to the solution's
// pick on the 1-5 scale; an unanswered spectrum scores 0, same as an
// unmatched label in the bounding-box minigame
export function calculateToneRatingAccuracy(
  solution: Record<string, number>,
  selections: ToneRatingSelections,
): number {
  const maxDistance: number = TONE_RATING_SCALE_MAX - TONE_RATING_SCALE_MIN;

  const scores: number[] = TONE_SPECTRUMS.map((spectrum: ToneSpectrum) => {
    const selected: number | null = selections[spectrum.key] ?? null;
    if (selected === null) return 0;

    const distance: number = Math.abs(selected - solution[spectrum.key]);
    return Math.max(0, 1 - distance / maxDistance);
  });

  return (
    scores.reduce((sum: number, score: number) => sum + score, 0) /
    scores.length
  );
}
