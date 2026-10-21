// Pure scale helpers of the dashboard charts (spec 046): ticks and paths that never produce NaN.
export interface Tick {
  value: number;
  y: number;
}

// Round steps (1, 2, 5 × 10ⁿ) covering `min..max` with about `count` ticks.
export function niceTicks(min: number, max: number, count = 4): number[] {
  const low = Math.min(min, 0);
  const high = Math.max(max, 0);
  const span = high - low;

  if (span === 0) {
    return [0, 1];
  }

  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 5, 10].map((factor) => factor * magnitude).find((s) => s >= raw) ??
    raw;
  const start = Math.floor(low / step) * step;
  const ticks: number[] = [];

  for (let value = start; value < high + step; value += step) {
    ticks.push(Number(value.toFixed(6)));
  }

  return ticks;
}

export function scaleY(
  value: number,
  domain: { max: number; min: number },
  height: number,
  top = 0,
): number {
  const span = domain.max - domain.min;

  return span === 0
    ? top + height
    : top + height - ((value - domain.min) / span) * height;
}

// `M x y L x y …`; an empty list gives an empty path.
export function toPath(points: { x: number; y: number }[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");
}
