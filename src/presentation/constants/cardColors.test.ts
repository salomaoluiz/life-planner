import { CARD_COLORS, DEFAULT_CARD_COLOR, isCardColor } from "./cardColors";

it("SHOULD offer 8 unique #RRGGBB swatches with the first as default", () => {
  expect(CARD_COLORS).toHaveLength(8);
  expect(new Set(CARD_COLORS.map((color) => color.value)).size).toBe(8);
  CARD_COLORS.forEach((color) =>
    expect(color.value).toMatch(/^#[0-9A-F]{6}$/i),
  );
  expect(DEFAULT_CARD_COLOR).toBe(CARD_COLORS[0].value);
});

it("SHOULD recognise palette colors ignoring case and reject others", () => {
  expect(isCardColor("#6366f1")).toBe(true);
  expect(isCardColor("#000000")).toBe(false);
});
