import { buildSegments, niceTicks, scaleY, toPath } from "./chartScale";

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

describe("buildSegments", () => {
  const coords = [
    { x: 0, y: 10 },
    { x: 10, y: 30 },
    { x: 20, y: 20 },
  ];

  it("SHOULD colour by side AND split the segment that crosses zero", () => {
    const segments = buildSegments(
      coords,
      [
        { projected: false, value: 100 },
        { projected: false, value: -100 },
        { projected: true, value: -50 },
      ],
      20,
      "green",
      "red",
    );

    expect(segments).toEqual([
      { color: "green", dashed: false, x1: 0, x2: 5, y1: 10, y2: 20 },
      { color: "red", dashed: false, x1: 5, x2: 10, y1: 20, y2: 30 },
      { color: "red", dashed: true, x1: 10, x2: 20, y1: 30, y2: 20 },
    ]);
  });

  it("SHOULD treat zero as positive AND return nothing for fewer than 2 points", () => {
    expect(
      buildSegments(
        coords.slice(0, 2),
        [
          { projected: false, value: 0 },
          { projected: false, value: 0 },
        ],
        20,
        "green",
        "red",
      )[0].color,
    ).toBe("green");
    expect(buildSegments([], [], 0, "g", "r")).toEqual([]);
  });
});
