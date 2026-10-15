import { FieldInvalid } from "@domain/entities/errors";

import {
  calendarDateToIso,
  isoToCalendarDate,
  todayCalendarDate,
} from "./calendarDate";

describe("round trip (any timezone)", () => {
  it.each(["2026-10-03", "2026-12-31", "2026-01-01", "2024-02-29"])(
    "SHOULD keep %s through API date -> entity ISO -> API date",
    (calendarDate) => {
      expect(isoToCalendarDate(calendarDateToIso(calendarDate))).toBe(
        calendarDate,
      );
    },
  );
});

describe("isoToCalendarDate", () => {
  it.each([
    ["late evening", new Date(2026, 9, 3, 23, 30)],
    ["just after midnight", new Date(2026, 9, 3, 0, 15)],
    ["noon", new Date(2026, 9, 3, 12, 0)],
  ])(
    "SHOULD use the LOCAL calendar day of a date picked at %s",
    (_label, picked) => {
      expect(isoToCalendarDate(picked.toISOString())).toBe("2026-10-03");
    },
  );

  it.each(["", "not a date", "2026-13-45T00:00:00Z"])(
    "SHOULD throw FieldInvalid for %j",
    (value) => {
      expect(() => isoToCalendarDate(value)).toThrow(FieldInvalid);
    },
  );
});

describe("calendarDateToIso", () => {
  it("SHOULD return the ISO of LOCAL midnight so toLocaleDateString shows the same day", () => {
    const date = new Date(calendarDateToIso("2026-10-03"));

    expect([
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
    ]).toEqual([2026, 9, 3, 0, 0]);
  });

  it.each([
    "",
    "2026-10-3",
    "03/10/2026",
    "2026-10-03T10:00:00Z",
    "2026-02-30",
    "2026-13-01",
  ])("SHOULD throw FieldInvalid for %j", (value) => {
    expect(() => calendarDateToIso(value)).toThrow(FieldInvalid);
  });
});

describe("todayCalendarDate", () => {
  it("SHOULD return the LOCAL calendar day of the given instant", () => {
    expect(todayCalendarDate(new Date(2026, 9, 5, 23, 59, 59))).toBe(
      "2026-10-05",
    );
    expect(todayCalendarDate(new Date(2026, 0, 1, 0, 0, 0))).toBe("2026-01-01");
  });

  it("SHOULD default to now", () => {
    jest.useFakeTimers({ now: new Date(2026, 11, 31, 12, 0, 0) });

    expect(todayCalendarDate()).toBe("2026-12-31");

    jest.useRealTimers();
  });
});
