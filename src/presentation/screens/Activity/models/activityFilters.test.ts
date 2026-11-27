import {
  activeFilterCount,
  ALL,
  filterKey,
  INITIAL_FILTERS,
  periodRange,
  toApiFilters,
} from "./activityFilters";

const now = new Date(2026, 10, 27, 15, 30, 0);

describe("periodRange", () => {
  it("SHOULD start at local midnight N days back AND end now", () => {
    expect(periodRange("today", now).from).toBe(
      new Date(2026, 10, 27, 0, 0, 0).toISOString(),
    );
    expect(periodRange("7d", now).from).toBe(
      new Date(2026, 10, 21, 0, 0, 0).toISOString(),
    );
    expect(periodRange("30d", now).to).toBe(now.toISOString());
  });
});

describe("toApiFilters", () => {
  it("SHOULD send only the module AND the last 30 days by default", () => {
    expect(toApiFilters("FINANCE", INITIAL_FILTERS, now)).toEqual({
      action: undefined,
      actorId: undefined,
      from: new Date(2026, 9, 29, 0, 0, 0).toISOString(),
      module: "FINANCE",
      ownerId: undefined,
      q: undefined,
      to: now.toISOString(),
    });
  });

  it("SHOULD pass the chosen filters AND a trimmed search", () => {
    expect(
      toApiFilters(
        "INVESTMENT",
        {
          action: "BATCH",
          actorId: "a-1",
          ownerId: "o-1",
          period: "7d",
          q: "  1.200,00 ",
        },
        now,
      ),
    ).toMatchObject({
      action: "BATCH",
      actorId: "a-1",
      module: "INVESTMENT",
      ownerId: "o-1",
      q: "1.200,00",
    });
  });
});

describe("activeFilterCount / filterKey", () => {
  it("SHOULD count the groups that differ from the default", () => {
    expect(activeFilterCount(INITIAL_FILTERS)).toBe(0);
    expect(
      activeFilterCount({
        action: "DELETE",
        actorId: ALL,
        ownerId: "o",
        period: "7d",
        q: "x",
      }),
    ).toBe(3);
  });

  it("SHOULD give another key when a filter or the day changes", () => {
    const base = toApiFilters("FINANCE", INITIAL_FILTERS, now);

    expect(filterKey(base)).toBe(filterKey({ ...base }));
    expect(filterKey(base)).not.toBe(filterKey({ ...base, action: "CREATE" }));
    expect(filterKey(base)).not.toBe(filterKey({ ...base, q: "mercado" }));
  });
});
