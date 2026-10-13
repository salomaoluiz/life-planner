import { getFontStyle, getTypography, tabularNums } from "./typography";

it("SHOULD define the spec scale (size/line/weight)", () => {
  const t = getTypography(false);

  expect(t.display).toMatchObject({
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 40,
  });
  expect(t.title).toMatchObject({
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  });
  expect(t.heading).toMatchObject({
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  });
  expect(t.body).toMatchObject({
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  });
  expect(t.bodyStrong).toMatchObject({
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  });
  expect(t.input).toMatchObject({
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  });
  expect(t.caption).toMatchObject({
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  });
  expect(t.overline).toMatchObject({
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    lineHeight: 16,
    textTransform: "uppercase",
  });
  expect(t.tab).toMatchObject({
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  });
});

it("SHOULD use Manrope families (no fontWeight) WHEN the fonts are loaded", () => {
  const t = getTypography(true);

  expect(t.body.fontFamily).toBe("Manrope_500Medium");
  expect(t.bodyStrong.fontFamily).toBe("Manrope_600SemiBold");
  expect(t.display.fontFamily).toBe("Manrope_700Bold");
  expect(t.body.fontWeight).toBeUndefined();
});

it("SHOULD fall back to the system font WHEN the fonts did not load", () => {
  expect(getTypography(false).body.fontFamily).toBeUndefined();
  expect(getFontStyle("700", false)).toEqual({ fontWeight: "700" });
  expect(getFontStyle("800", true)).toEqual({
    fontFamily: "Manrope_800ExtraBold",
  });
});

it("SHOULD expose tabular numerals", () => {
  expect(tabularNums).toEqual({ fontVariant: ["tabular-nums"] });
});
