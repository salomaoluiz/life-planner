import { niceTicks, scaleY, toPath } from "./chartScale";

it("SHOULD build round ticks that cover the data and the zero line", () => {
  expect(niceTicks(0, 950)).toEqual([0, 500, 1000]);
  expect(niceTicks(-300, 700)).toEqual([-500, 0, 500, 1000]);
});

it("SHOULD return a usable axis when everything is zero", () => {
  expect(niceTicks(0, 0)).toEqual([0, 1]);
});

it("SHOULD map a value to the y of the chart AND not divide by zero", () => {
  expect(scaleY(50, { max: 100, min: 0 }, 200)).toBe(100);
  expect(scaleY(0, { max: 100, min: 0 }, 200, 10)).toBe(210);
  expect(scaleY(5, { max: 5, min: 5 }, 200)).toBe(200);
});

it("SHOULD join the points in a path", () => {
  expect(
    toPath([
      { x: 0, y: 1 },
      { x: 2, y: 3 },
    ]),
  ).toBe("M0 1 L2 3");
  expect(toPath([])).toBe("");
});
