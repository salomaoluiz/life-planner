import colors from "./colors";
import { investmentClassPalette } from "./investmentClassPalette";

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (high + 0.05) / (low + 0.05);
}

describe.each(["light", "dark"] as const)(
  "investment class colors (%s)",
  (mode) => {
    const palette = Object.entries(investmentClassPalette[mode]);

    it("SHOULD give each of the 5 classes its own colour", () => {
      expect(palette.map(([name]) => name).sort()).toEqual([
        "BR_REIT",
        "BR_STOCK",
        "FIXED_INCOME",
        "FOREIGN_STOCK",
        "PRIVATE",
      ]);
      expect(new Set(palette.map(([, color]) => color)).size).toBe(5);
    });

    it("SHOULD tell every pair apart by lightness, not by hue alone (ratio >= 1.2)", () => {
      palette.forEach(([nameA, a], index) =>
        palette.slice(index + 1).forEach(([nameB, b]) => {
          expect([nameA, nameB, ratio(a, b) >= 1.2]).toEqual([
            nameA,
            nameB,
            true,
          ]);
        }),
      );
    });

    it("SHOULD stand out from the surface of its theme (ratio >= 1.5)", () => {
      const surface = colors[mode].surface;

      palette.forEach(([name, color]) =>
        expect([name, ratio(color, surface) >= 1.5]).toEqual([name, true]),
      );
    });
  },
);
