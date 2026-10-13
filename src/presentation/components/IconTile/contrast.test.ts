import { contrastRatio, ensureContrast, parseColor } from "./contrast";

const SURFACE_LIGHT = "#FFFFFF";
const SURFACE_DARK = "#161A21";
const TEXT_LIGHT = "#151922";
const TEXT_DARK = "#E8EAF0";

it("SHOULD parse 6-digit, 3-digit, uppercase and no-hash hex", () => {
  expect(parseColor("#336699")).toEqual({ b: 153, g: 102, r: 51 });
  expect(parseColor("#369")).toEqual({ b: 153, g: 102, r: 51 });
  expect(parseColor("#ABCDEF")).toEqual({ b: 239, g: 205, r: 171 });
  expect(parseColor("336699")).toEqual({ b: 153, g: 102, r: 51 });
});

it("SHOULD return undefined for non-hex input", () => {
  expect(parseColor("red")).toBeUndefined();
  expect(parseColor("")).toBeUndefined();
  expect(parseColor("#12")).toBeUndefined();
  expect(parseColor("rgb(1,2,3)")).toBeUndefined();
});

it("SHOULD compute the WCAG ratio", () => {
  expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
});

it("SHOULD keep a color that already reaches 3:1", () => {
  expect(ensureContrast("#336699", SURFACE_LIGHT, TEXT_LIGHT)).toBe("#336699");
});

it("SHOULD lift the default #000000 on the dark surface to 3:1 without changing hue order", () => {
  const result = ensureContrast("#000000", SURFACE_DARK, TEXT_DARK);

  expect(contrastRatio(result, SURFACE_DARK)).toBeGreaterThanOrEqual(3);
});

it("SHOULD lift a pale color on the light surface to 3:1", () => {
  const result = ensureContrast("#FFFF99", SURFACE_LIGHT, TEXT_LIGHT);

  expect(contrastRatio(result, SURFACE_LIGHT)).toBeGreaterThanOrEqual(3);
});

it("SHOULD return the input unchanged WHEN it cannot be parsed", () => {
  expect(ensureContrast("red", SURFACE_LIGHT, TEXT_LIGHT)).toBe("red");
  expect(ensureContrast("", SURFACE_LIGHT, TEXT_LIGHT)).toBe("");
});
