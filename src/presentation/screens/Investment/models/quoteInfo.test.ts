import { InvestmentPriceSource } from "@domain/entities/investment/enums";

import {
  makeAsset,
  makePosition,
  makeQuote,
  makeUsdAsset,
} from "../mocks/fixtures";
import {
  hasQuotedAssets,
  isQuoteUnavailable,
  latestQuoteTime,
  todayChange,
  updatedInfo,
} from "./quoteInfo";

function timeOf(iso: string) {
  return iso.slice(11, 16);
}

describe("updatedInfo", () => {
  const now = new Date(2026, 10, 4, 18, 0);
  function at(day: string) {
    return `${day}T13:00:00.000Z`;
  }

  it("SHOULD say the time WHEN the quote is from today AND warn only WHEN stale", () => {
    const fresh = makeUsdAsset({
      quote: makeQuote({ quotedAt: at("2026-11-04") }),
    });
    const stale = makeUsdAsset({
      quote: makeQuote({ quotedAt: at("2026-11-04"), stale: true }),
    });

    expect(updatedInfo(fresh, now, timeOf)).toEqual({
      kind: "time",
      time: "13:00",
      warning: false,
    });
    expect(updatedInfo(stale, now, timeOf).warning).toBe(true);
  });

  it("SHOULD say yesterday with the time, then a date after that (always a warning)", () => {
    const yesterday = makeUsdAsset({
      quote: makeQuote({ quotedAt: at("2026-11-03"), stale: true }),
    });
    const old = makeUsdAsset({
      quote: makeQuote({ quotedAt: at("2026-10-28") }),
    });

    expect(updatedInfo(yesterday, now, timeOf)).toEqual({
      kind: "yesterday",
      time: "13:00",
      warning: true,
    });
    expect(updatedInfo(old, now, timeOf)).toEqual({
      date: "2026-10-28",
      kind: "date",
      warning: true,
    });
  });

  it("SHOULD say manual WHEN a manual value wins, warning only over a quoted ticker", () => {
    const position = makePosition({ currentValueDate: "2026-10-28" });
    const unlisted = makeAsset({
      position,
      priceSource: InvestmentPriceSource.MANUAL,
      quote: null,
    });
    const overQuote = makeUsdAsset({
      position,
      priceSource: InvestmentPriceSource.MANUAL,
    });

    expect(updatedInfo(unlisted, now, timeOf)).toEqual({
      date: "2026-10-28",
      kind: "manual",
      warning: false,
    });
    expect(updatedInfo(overQuote, now, timeOf).warning).toBe(true);
  });

  it("SHOULD be empty WHEN there is no price", () => {
    expect(updatedInfo(makeAsset(), now, timeOf)).toEqual({
      kind: "none",
      warning: false,
    });
  });
});

describe("quote helpers", () => {
  it("SHOULD turn the percent of the API into a fraction ONLY for a quoted price", () => {
    expect(todayChange(makeUsdAsset())).toBeCloseTo(0.0124);
    expect(
      todayChange(makeUsdAsset({ priceSource: InvestmentPriceSource.MANUAL })),
    ).toBeNull();
    expect(
      todayChange(makeUsdAsset({ quote: makeQuote({ changePercent: null }) })),
    ).toBeNull();
    expect(
      todayChange(makeUsdAsset({ quote: makeQuote({ changePercent: "x" }) })),
    ).toBeNull();
    expect(todayChange(makeAsset())).toBeNull();
  });

  it("SHOULD flag an unavailable quote", () => {
    expect(
      isQuoteUnavailable(
        makeUsdAsset({ quote: makeQuote({ unavailable: true }) }),
      ),
    ).toBe(true);
    expect(isQuoteUnavailable(makeAsset())).toBe(false);
  });

  it("SHOULD find the latest quote time AND whether any asset is quoted", () => {
    const assets = [
      makeUsdAsset({
        quote: makeQuote({ quotedAt: "2026-11-04T10:00:00.000Z" }),
      }),
      makeUsdAsset({
        quote: makeQuote({ quotedAt: "2026-11-04T16:00:00.000Z" }),
      }),
      makeAsset(),
    ];

    expect(latestQuoteTime(assets)).toBe("2026-11-04T16:00:00.000Z");
    expect(latestQuoteTime([makeAsset()])).toBeNull();
    expect(hasQuotedAssets(assets)).toBe(true);
    expect(hasQuotedAssets([makeAsset()])).toBe(false);
  });
});
