import overviewMaxWidth from "./overviewWidth";

it("SHOULD be 70% of the window with a 960 px floor", () => {
  expect(overviewMaxWidth(1280, 240)).toBe(960);
  expect(overviewMaxWidth(1920, 240)).toBe(1344);
  expect(overviewMaxWidth(2560, 240)).toBe(1792);
});

it("SHOULD never be wider than the area right of the rail", () => {
  expect(overviewMaxWidth(1024, 240)).toBe(784);
});
