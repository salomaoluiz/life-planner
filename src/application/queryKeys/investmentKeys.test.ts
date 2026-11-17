import { investmentKeys } from "./investmentKeys";

it("SHOULD build every key under the investment root", () => {
  expect(investmentKeys.all()).toEqual(["investment"]);
  expect(investmentKeys.assets("ACTIVE")).toEqual([
    "investment",
    "assets",
    "ACTIVE",
  ]);
  expect(investmentKeys.asset("a1")).toEqual(["investment", "asset", "a1"]);
});

it("SHOULD key the market indexes and the history of one index by period", () => {
  expect(investmentKeys.marketIndexes()).toEqual([
    "investment",
    "market-indexes",
  ]);
  expect(
    investmentKeys.marketIndexHistory("CDI", "2025-11-12", "2026-11-12"),
  ).toEqual([
    "investment",
    "market-index-history",
    "CDI",
    "2025-11-12",
    "2026-11-12",
  ]);
});
