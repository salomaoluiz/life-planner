import { Duration } from "@infrastructure/date/types";

import { setup } from "./mocks/add.mocks";

it.each([Duration.milliseconds])(
  "SHOULD add time to date when type is %s",
  (type) => {
    const result = setup(new Date("2025-01-01T00:00:00.000Z"), 1000000, type);

    expect(result).toEqual(new Date("2025-01-01T00:16:40.000Z"));
  },
);
