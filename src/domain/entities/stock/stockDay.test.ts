import { formatDay, optionalDay, parseDay } from "./stockDay";

describe("stockDay", () => {
  it("SHOULD read a calendar day in local time and write it back unchanged", () => {
    const date = parseDay("2026-11-20");

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 10, 20,
    ]);
    expect(formatDay(date)).toBe("2026-11-20");
    expect(formatDay(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("SHOULD read an optional day", () => {
    expect(optionalDay("2026-11-20")).toEqual(new Date(2026, 10, 20));
    expect(optionalDay(null)).toBeUndefined();
    expect(optionalDay(undefined)).toBeUndefined();
  });
});
