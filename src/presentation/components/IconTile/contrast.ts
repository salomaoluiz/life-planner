interface Rgb {
  b: number;
  g: number;
  r: number;
}

export function contrastRatio(a: string, b: string): number {
  const first = parseColor(a);
  const second = parseColor(b);

  if (!first || !second) {
    return 1;
  }
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (x, y) => y - x,
  );

  return (light + 0.05) / (dark + 0.05);
}

export function ensureContrast(
  color: string,
  background: string,
  textPrimary: string,
  minRatio = 3,
): string {
  const source = parseColor(color);
  const target = parseColor(textPrimary);

  if (!source || !target || contrastRatio(color, background) >= minRatio) {
    return color;
  }
  for (let step = 1; step <= 20; step += 1) {
    const t = step / 20;
    const mixed = toHex({
      b: source.b + (target.b - source.b) * t,
      g: source.g + (target.g - source.g) * t,
      r: source.r + (target.r - source.r) * t,
    });

    if (contrastRatio(mixed, background) >= minRatio) {
      return mixed;
    }
  }

  return textPrimary;
}

export function parseColor(value: string): Rgb | undefined {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());

  if (!match) {
    return undefined;
  }
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : match[1];

  return {
    b: parseInt(hex.slice(4, 6), 16),
    g: parseInt(hex.slice(2, 4), 16),
    r: parseInt(hex.slice(0, 2), 16),
  };
}

function channel(value: number) {
  const s = value / 255;

  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance({ b, g, r }: Rgb) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function toHex({ b, g, r }: Rgb) {
  return `#${[r, g, b]
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}
