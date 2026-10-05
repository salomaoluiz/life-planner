import colors from "./colors";

type Rgb = [number, number, number];
type Rgba = [number, number, number, number];

function contrast(foreground: Rgb, background: Rgb) {
  const [a, b] = [luminance(foreground), luminance(background)].sort(
    (x, y) => y - x,
  );
  return (a + 0.05) / (b + 0.05);
}

function luminance(rgb: Rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function over([r, g, b, a]: Rgba, base: Rgb): Rgb {
  return [
    r * a + base[0] * (1 - a),
    g * a + base[1] * (1 - a),
    b * a + base[2] * (1 - a),
  ];
}

function parse(value: string): Rgba {
  if (value.startsWith("#")) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
    return [r, g, b, 1];
  }
  const [r, g, b, a = 1] = value
    .replace(/rgba?\(|\)|\s/g, "")
    .split(",")
    .map(Number);
  return [r, g, b, a];
}

const themes = [
  ["dark", colors.dark],
  ["light", colors.light],
] as const;

function opaque(value: string): Rgb {
  return over(parse(value), [0, 0, 0]);
}

describe.each(themes)("%s theme contrast", (_name, theme) => {
  const texts = [
    "textPrimary",
    "textSecondary",
    "accentText",
    "income",
    "expense",
    "warning",
  ] as const;
  const surfaces = ["background", "surface", "surfaceRaised"] as const;

  it.each(texts.flatMap((t) => surfaces.map((s) => [t, s] as const)))(
    "SHOULD keep %s >= 4.5:1 on %s",
    (text, surface) => {
      expect(
        contrast(opaque(theme[text]), opaque(theme[surface])),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("SHOULD keep onAccent >= 4.5:1 on accent", () => {
    expect(
      contrast(opaque(theme.onAccent), opaque(theme.accent)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["accentText", "accentSoft"],
    ["income", "incomeSoft"],
    ["expense", "expenseSoft"],
    ["warning", "warningSoft"],
  ] as const)(
    "SHOULD keep %s >= 4.5:1 on %s (soft composited over surface)",
    (text, soft) => {
      const background = over(parse(theme[soft]), opaque(theme.surface));
      expect(contrast(opaque(theme[text]), background)).toBeGreaterThanOrEqual(
        4.5,
      );
    },
  );
});
