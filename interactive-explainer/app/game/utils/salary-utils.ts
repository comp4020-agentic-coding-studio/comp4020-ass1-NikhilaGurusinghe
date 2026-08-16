// day pay bounds (not hourly rate x workday - a day's total pay ranges
// between these two directly), so the assumed workday length below only
// affects the *implied* effective hourly rate, not the actual payout
export const BASE_DAY_PAY_USD: number = 20;
export const MAX_DAY_PAY_USD: number = 40;
// used only to describe the implied hourly rate (base/max day pay divided by
// this) - not multiplied into the payout itself
export const ASSUMED_WORKDAY_HOURS: number = 3;
// rough, shared across all three minigames - none of them clearly warrant a
// different expected duration, so this isn't tuned per-minigame
export const EXPECTED_SECONDS_PER_TASK: number = 20;

// 1 at/under expected time, falling off towards 0 the longer it takes -
// deliberately not >1 for going faster, so speed alone can't be farmed;
// accuracy is what actually drives pay up
function speedScore(elapsedMS: number): number {
  const expectedMS = EXPECTED_SECONDS_PER_TASK * 1000;
  return Math.min(1, expectedMS / Math.max(elapsedMS, 1));
}

// blends accuracy and speed into a single 0-1 performance score, then maps
// that onto a day's total pay between the base and max above
export function calculateTaskSalary(
  accuracy: number,
  elapsedMS: number,
  iterationsPerSession: number,
): number {
  const performance = (accuracy + speedScore(elapsedMS)) / 2;
  const dayPay =
    BASE_DAY_PAY_USD + (MAX_DAY_PAY_USD - BASE_DAY_PAY_USD) * performance;

  return Math.round((dayPay / iterationsPerSession) * 100) / 100;
}
