import { InvestmentMarketIndexes } from "@domain/entities/investment/InvestmentEntities";

import {
  followersText,
  isEmptyIndexes,
  monthLabel,
  percentLabel,
  staleNotice,
  updatedWhen,
} from "./settingsModel";

const empty: InvestmentMarketIndexes = {
  cdi: null,
  fx: [],
  ipca: null,
  lastSuccessAt: null,
  selic: null,
};
const filled: InvestmentMarketIndexes = {
  cdi: {
    annual: "14.90",
    daily: "0.05513100",
    date: "2026-11-11",
    followers: 4,
    lastChangeDate: "2026-06-18",
    stale: false,
  },
  fx: [],
  ipca: null,
  lastSuccessAt: "2026-11-12T13:10:00.000Z",
  selic: null,
};

describe("percentLabel", () => {
  it("SHOULD format with the places AND the locale, and show a dash for null", () => {
    expect(percentLabel("14.9", 2, "pt-BR")).toBe("14,90");
    expect(percentLabel("14.9", 2, "en-US")).toBe("14.90");
    expect(percentLabel("0.055131", 6, "pt-BR")).toBe("0,055131");
    expect(percentLabel(null, 2, "pt-BR")).toBe("—");
  });
});

describe("monthLabel", () => {
  it("SHOULD write the month AND the year of a YYYY-MM", () => {
    expect(monthLabel("2026-10", "pt-BR")).toMatch(/out.*2026/i);
    expect(monthLabel("2026-10", "en-US")).toMatch(/Oct.*2026/);
  });
});

describe("followersText", () => {
  it("SHOULD show a dash for no follower AND the number otherwise", () => {
    expect(followersText(0)).toBe("—");
    expect(followersText(4)).toBe("4");
  });
});

describe("isEmptyIndexes", () => {
  it("SHOULD be true only BEFORE the first run", () => {
    expect(isEmptyIndexes(empty)).toBe(true);
    expect(isEmptyIndexes(filled)).toBe(false);
  });
});

describe("updatedWhen", () => {
  const now = new Date("2026-11-13T15:00:00");

  it("SHOULD say never WHEN nothing was ever stored", () => {
    expect(updatedWhen(null, now, "en-US").key).toBe(
      "investment.settings.never",
    );
  });

  it("SHOULD say today, yesterday or the date with the time", () => {
    const today = updatedWhen(
      new Date("2026-11-13T10:05:00").toISOString(),
      now,
      "en-US",
    );
    const yesterday = updatedWhen(
      new Date("2026-11-12T19:05:00").toISOString(),
      now,
      "en-US",
    );
    const older = updatedWhen(
      new Date("2026-11-02T19:05:00").toISOString(),
      now,
      "pt-BR",
    );

    expect(today.key).toBe("investment.settings.when.today");
    expect(today.params.time).toMatch(/10:05/);
    expect(yesterday.key).toBe("investment.settings.when.yesterday");
    expect(older.key).toBe("investment.settings.when.date");
    expect(older.params.date).toBe("02/11/2026");
  });
});

describe("staleNotice", () => {
  it("SHOULD be null WHEN no index is stale", () => {
    expect(staleNotice(filled, "pt-BR")).toBeNull();
  });

  it("SHOULD name the last success, the index AND its last saved value", () => {
    const notice = staleNotice(
      { ...filled, cdi: { ...filled.cdi!, stale: true } },
      "pt-BR",
    );

    expect(notice).toEqual({
      date: "12/11/2026",
      index: "CDI",
      value: "14,90",
      valueDate: "11/11/2026",
    });
  });

  it("SHOULD pick the Selic or the IPCA WHEN only they are stale", () => {
    const selic = staleNotice(
      {
        ...empty,
        lastSuccessAt: "2026-11-12T13:10:00.000Z",
        selic: {
          daily: null,
          date: "2026-11-11",
          followers: 0,
          lastChangeDate: null,
          stale: true,
          target: "15",
        },
      },
      "en-US",
    );
    const ipca = staleNotice(
      {
        ...empty,
        ipca: {
          accumulated12m: "4.68",
          expected12m: null,
          expectedDate: null,
          followers: 0,
          month: "2026-10",
          monthly: "0.32",
          stale: true,
        },
        lastSuccessAt: null,
      },
      "en-US",
    );

    expect(selic).toMatchObject({ index: "Selic", value: "15.00" });
    expect(ipca).toMatchObject({
      index: "IPCA",
      value: "4.68",
      valueDate: "10/2026",
    });
    expect(ipca?.date).toBe("—");
  });
});
