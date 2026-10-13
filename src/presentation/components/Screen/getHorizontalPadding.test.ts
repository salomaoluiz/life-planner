import { getHorizontalPadding } from "./getHorizontalPadding";

it("SHOULD use the lg padding on compact", () => {
  expect(getHorizontalPadding(390, "compact", 20)).toBe(20);
  expect(getHorizontalPadding(320, "compact", 20)).toBe(20);
});

it("SHOULD center a 720 px column on medium and expanded", () => {
  expect(getHorizontalPadding(800, "medium", 20)).toBe(40);
  expect(getHorizontalPadding(1280, "expanded", 20)).toBe(280);
});

it("SHOULD never go below lg", () => {
  expect(getHorizontalPadding(730, "medium", 20)).toBe(20);
});
