import { Duration } from "@infrastructure/date/types";

import { setup } from "./mocks/difference.mocks";

const from = new Date("2025-01-11T00:00:00.000Z");
const to = new Date("2025-01-01T00:00:00.000Z");

it.each([
  [Duration.days, 10],
  [Duration.milliseconds, 864000000],
  [Duration.years, 0],
])("SHOULD return the difference WHEN type is %s", (type, expected) => {
  expect(setup(from, to, type)).toBe(expected);
});

it("SHOULD return a full year WHEN dates are 1 year apart and type is years", () => {
  expect(setup(new Date("2026-01-01T00:00:00.000Z"), to, Duration.years)).toBe(
    1,
  );
});

it("SHOULD return a negative number WHEN the compared date is in the future", () => {
  expect(setup(to, from, Duration.days)).toBe(-10);
});
