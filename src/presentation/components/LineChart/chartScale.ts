export interface LineSegment {
  color: string;
  dashed: boolean;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

// Pure scale helpers of the dashboard charts (spec 046): ticks and paths that never produce NaN.
export interface Tick {
  value: number;
  y: number;
}

// The left margin of the chart: the width of the longest axis label (about 0.6 em per character) plus a gap, so no label is clipped.
export function axisWidth(
  labels: string[],
  fontSize: number,
  min: number,
): number {
  const longest = Math.max(0, ...labels.map((label) => label.length));

  return Math.max(min, Math.ceil(longest * fontSize * 0.6 + 8));
}

// One segment per pair of points, split where the line crosses zero so each part takes the colour of its side;
// the segments that lead to a projected point are dashed.
export function buildSegments(
  coords: { x: number; y: number }[],
  points: { projected: boolean; value: number }[],
  baseline: number,
  positive: string,
  negative: string,
): LineSegment[] {
  const segments: LineSegment[] = [];

  function colorOf(value: number) {
    return value < 0 ? negative : positive;
  }

  for (let index = 0; index < coords.length - 1; index += 1) {
    const [a, b] = [coords[index], coords[index + 1]];
    const [v1, v2] = [points[index].value, points[index + 1].value];
    const dashed = points[index + 1].projected;

    if (v1 * v2 < 0) {
      const crossX = a.x + (v1 / (v1 - v2)) * (b.x - a.x);

      segments.push(
        {
          color: colorOf(v1),
          dashed,
          x1: a.x,
          x2: crossX,
          y1: a.y,
          y2: baseline,
        },
        {
          color: colorOf(v2),
          dashed,
          x1: crossX,
          x2: b.x,
          y1: baseline,
          y2: b.y,
        },
      );
    } else {
      segments.push({
        color: colorOf(v1 === 0 ? v2 : v1),
        dashed,
        x1: a.x,
        x2: b.x,
        y1: a.y,
        y2: b.y,
      });
    }
  }

  return segments;
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
