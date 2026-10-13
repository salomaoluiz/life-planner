import { getHitSlop } from "./getHitSlop";

it("SHOULD return undefined WHEN the element already reaches the minimum", () => {
  expect(getHitSlop({ height: 44, width: 44 }, 44)).toBeUndefined();
  expect(getHitSlop({ height: 60 }, 44)).toBeUndefined();
});

it("SHOULD split the missing height between top and bottom", () => {
  expect(getHitSlop({ height: 36 }, 44)).toEqual({ bottom: 4, top: 4 });
});

it("SHOULD round odd differences up and include the width WHEN given", () => {
  expect(getHitSlop({ height: 41, width: 30 }, 44)).toEqual({
    bottom: 2,
    left: 7,
    right: 7,
    top: 2,
  });
});
