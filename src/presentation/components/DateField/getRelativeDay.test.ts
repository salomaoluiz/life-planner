import { getRelativeDay } from "./getRelativeDay";

const now = new Date(2025, 0, 15, 10, 0, 0);

it("SHOULD return today for the same calendar day regardless of time", () => {
  expect(getRelativeDay(new Date(2025, 0, 15, 0, 0, 0), now)).toBe("today");
  expect(getRelativeDay(new Date(2025, 0, 15, 23, 59, 59), now)).toBe("today");
});

it("SHOULD return yesterday for the previous calendar day, also across month and year", () => {
  expect(getRelativeDay(new Date(2025, 0, 14, 23, 0, 0), now)).toBe(
    "yesterday",
  );
  expect(getRelativeDay(new Date(2024, 11, 31), new Date(2025, 0, 1))).toBe(
    "yesterday",
  );
});

it("SHOULD return undefined otherwise and for invalid dates", () => {
  expect(getRelativeDay(new Date(2025, 0, 16), now)).toBeUndefined();
  expect(getRelativeDay(new Date(2025, 0, 13), now)).toBeUndefined();
  expect(getRelativeDay(new Date("nope"), now)).toBeUndefined();
});
