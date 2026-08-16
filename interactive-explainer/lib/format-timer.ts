export function formatTimer(elapsedMS: number): string {
  const totalSeconds: number = Math.floor(elapsedMS / 1000);
  const minutes: number = Math.floor(totalSeconds / 60);
  const seconds: number = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
