import { formatDate, formatDateTime, timeAgo } from "./utils";

const NOW = new Date("2026-10-30T12:00:00Z").getTime();

describe("timeAgo", () => {
  it.each([
    ["2026-10-30T11:58:00Z", 2, "versions.timeAgo.minutes"],
    ["2026-10-30T09:00:00Z", 3, "versions.timeAgo.hours"],
    ["2026-10-27T12:00:00Z", 3, "versions.timeAgo.days"],
    ["2026-10-30T11:59:30Z", 0, "versions.timeAgo.now"],
    ["2026-10-30T12:05:00Z", 0, "versions.timeAgo.now"],
  ])("SHOULD describe %s as %i (%s)", (iso, count, key) => {
    expect(timeAgo(iso, NOW)).toEqual({ count, key });
  });

  it("SHOULD be null WHEN never checked", () => {
    expect(timeAgo(null, NOW)).toBeNull();
  });
});

describe("formatDate / formatDateTime", () => {
  it("SHOULD format in the given locale", () => {
    expect(formatDate("2026-10-30T12:00:00Z", "en-US")).toMatch(/10\/30\/26/);
    expect(formatDate("2026-10-30T12:00:00Z", "pt-BR")).toMatch(/30\/10\/2026/);
    expect(formatDateTime("2026-10-30T12:00:00Z", "pt-BR")).toMatch(
      /30\/10\/2026/,
    );
  });

  it("SHOULD be null for a missing or invalid value", () => {
    expect(formatDate(null, "en-US")).toBeNull();
    expect(formatDate("nope", "en-US")).toBeNull();
    expect(formatDateTime(null, "en-US")).toBeNull();
    expect(formatDateTime("nope", "en-US")).toBeNull();
  });
});
