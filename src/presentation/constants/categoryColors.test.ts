import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_COLOR,
  isHexColor,
  isPaletteColor,
  LEGACY_BLACK,
  normalizeCategoryColor,
} from "./categoryColors";

it("SHOULD have the 12 palette colors of the spec in order", () => {
  expect(CATEGORY_COLORS.map((color) => color.value)).toEqual([
    "#F59E0B",
    "#F97316",
    "#EF4444",
    "#EC4899",
    "#8B5CF6",
    "#6366F1",
    "#3B82F6",
    "#06B6D4",
    "#14B8A6",
    "#22C55E",
    "#84CC16",
    "#64748B",
  ]);
});

it("SHOULD default new categories to indigo, which is in the palette", () => {
  expect(DEFAULT_CATEGORY_COLOR).toBe("#6366F1");
  expect(isPaletteColor(DEFAULT_CATEGORY_COLOR)).toBe(true);
});

it("SHOULD match palette colors case-insensitively and reject others", () => {
  expect(isPaletteColor("#f59e0b")).toBe(true);
  expect(isPaletteColor("#123456")).toBe(false);
  expect(isPaletteColor(LEGACY_BLACK)).toBe(false);
});

it("SHOULD map the legacy black token to a hex and keep hex values", () => {
  expect(normalizeCategoryColor("black")).toBe(LEGACY_BLACK);
  expect(normalizeCategoryColor("#3B82F6")).toBe("#3B82F6");
});

it("SHOULD validate #RRGGBB values only", () => {
  expect(isHexColor("#a1B2c3")).toBe(true);
  expect(isHexColor("a1b2c3")).toBe(false);
  expect(isHexColor("#abc")).toBe(false);
  expect(isHexColor("#12345G")).toBe(false);
});
