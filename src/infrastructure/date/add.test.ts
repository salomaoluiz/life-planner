import { Duration } from "@infrastructure/date/types";

import { setup } from "./mocks/add.mocks";

it.each([
  [Duration.days, new Date("2025-01-11T00:00:00.000Z")],
  [Duration.milliseconds, new Date("2025-01-01T00:00:00.010Z")],
  [Duration.years, new Date("2035-01-01T00:00:00.000Z")],
])("SHOULD add 10 to date WHEN type is %s", (type, expected) => {
  expect(setup(new Date("2025-01-01T00:00:00.000Z"), 10, type)).toEqual(
    expected,
  );
});

it("SHOULD add time to a numeric timestamp", () => {
  const result = setup(
    new Date("2025-01-01T00:00:00.000Z").getTime(),
    1000000,
    Duration.milliseconds,
  );

  expect(result).toEqual(new Date("2025-01-01T00:16:40.000Z"));
});
