import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import {
  InvestmentDashboard,
  InvestmentDashboardBucket,
  InvestmentValueKind,
} from "@domain/entities/investment/InvestmentEntities";

import {
  buildAllocation,
  buildIncome,
  buildRanking,
  buildTiles,
  filterRanking,
  rankingSubline,
  signText,
  visibleRanking,
} from "./dashboardModel";

function t(key: string) {
  return key;
}

const dashboard: InvestmentDashboard = {
  allocation: [
    {
      assetClass: InvestmentAssetClass.BR_STOCK,
      share: 0.66,
      usd: undefined,
      value: 120000,
    },
    {
      assetClass: InvestmentAssetClass.FOREIGN_STOCK,
      share: 0.34,
      usd: {
        fxRate: "5.5601",
        resultFromAsset: 515047,
        resultFromFx: 155732,
        value: "4628",
      },
      value: 62000,
    },
  ],
  incomes: [
    {
      byType: {
        DIVIDEND: 2,
        INTEREST: 0,
        JCP: 0,
        OTHER: 0,
        YIELD: 0,
      },
      date: "2026-11-04",
      planned: 41000,
      received: 128430,
    },
  ],
  period: {
    bucket: InvestmentDashboardBucket.MONTH,
    from: "2025-12-01",
    to: "2026-11-04",
  },
  ranking: [
    {
      assetClass: InvestmentAssetClass.BR_STOCK,
      assetId: "asset-1",
      currency: "BRL",
      name: "Itausa",
      openResult: 20000,
      openResultPercent: 0.2,
      share: 0.66,
      ticker: "ITSA4",
      usdValue: undefined,
      value: 120000,
      valueKind: InvestmentValueKind.QUOTE,
    },
    {
      assetClass: InvestmentAssetClass.FOREIGN_STOCK,
      assetId: "asset-2",
      currency: "USD",
      name: "Apple Inc.",
      openResult: 670779,
      openResultPercent: 0.3525,
      share: 0.34,
      ticker: "AAPL",
      usdValue: "4628",
      value: 62000,
      valueKind: InvestmentValueKind.FIXED_INCOME_NET,
    },
  ],
  series: [
    { date: "2025-12-31", invested: undefined, marketValue: undefined },
    { date: "2026-11-04", invested: 16290000, marketValue: 18432055 },
  ],
  summary: {
    assetsWithoutValue: 0,
    currentValue: 18432055,
    historyStartsAt: "2025-08-04",
    incomePlanned: 41000,
    incomeReceived: 128430,
    invested: 16290000,
    openResult: 2142055,
    openResultPercent: 0.1315,
    operationsWithoutFxRate: 0,
    realizedResult: 318040,
    salesCount: 4,
    staleQuotes: 0,
  },
};

describe("buildTiles (spec 110)", () => {
  it("SHOULD build the five tiles with sign, tone and captions", () => {
    const tiles = buildTiles({
      currency: "BRL",
      dashboard,
      localeTag: "en-US",
      t,
    });

    expect(tiles.map((tile) => tile.testID)).toEqual([
      "investment.overview.tile-current-value",
      "investment.overview.tile-invested",
      "investment.overview.tile-open-result",
      "investment.overview.tile-realized",
      "investment.overview.tile-income",
    ]);
    expect(tiles[2].value).toMatch(/^\+/);
    expect(tiles[2].tone).toBe("income");
    expect(tiles[4].caption).toContain("incomePlanned");
  });
});

describe("signText", () => {
  it("SHOULD carry the sign AND never double it", () => {
    expect(signText(2142055, "en-US", "BRL")).toMatch(/^\+ R\$/);
    expect(signText(-31240, "en-US", "BRL")).toMatch(/^− R\$/);
    expect(signText(0, "en-US", "BRL")).not.toMatch(/^[+−]/);
  });
});

describe("buildAllocation (spec 110)", () => {
  it("SHOULD label the classes AND show the total in the center without a filter", () => {
    const allocation = buildAllocation({
      dashboard,
      isDark: false,
      localeTag: "en-US",
      t,
    });

    expect(allocation.rows).toHaveLength(2);
    expect(allocation.centerLabel).toBe("investment.overview.allocation.total");
    expect(allocation.rows[1].label).toBe(
      "investment.classGroup.FOREIGN_STOCK",
    );
    expect(allocation.rows[0].share).toBe(0.66);
  });

  it("SHOULD show the share of the selected class in the center", () => {
    const allocation = buildAllocation({
      dashboard,
      isDark: false,
      localeTag: "en-US",
      selected: InvestmentAssetClass.FOREIGN_STOCK,
      t,
    });

    expect(allocation.centerValue).toMatch(/%$/);
    expect(allocation.rows[1].pressed).toBe(true);
  });
});

describe("ranking (spec 110)", () => {
  it("SHOULD filter by class AND page the rows", () => {
    expect(
      filterRanking(dashboard.ranking, InvestmentAssetClass.BR_STOCK),
    ).toHaveLength(1);
    expect(visibleRanking(dashboard.ranking, false)).toHaveLength(2);
    expect(visibleRanking(dashboard.ranking, true)).toHaveLength(2);
  });

  it("SHOULD describe the second line with the US$ value AND the value note", () => {
    expect(rankingSubline(dashboard.ranking[1], "34%", t)).toBe(
      "US$ 4628 · investment.overview.ranking.fixedIncomeNet · 34%",
    );
    expect(rankingSubline(dashboard.ranking[0], "66%", t)).toBe("66%");
  });

  it("SHOULD normalize the result percent sign", () => {
    const ranking = buildRanking({
      dashboard,
      expanded: false,
      isDark: false,
      localeTag: "en-US",
      t,
    });

    expect(ranking.rows[0].resultPercent).toBe("+20%");
    expect(ranking.rows[0].tone).toBe("income");
  });
});

describe("buildIncome (spec 110)", () => {
  it("SHOULD label the buckets AND keep received and planned apart", () => {
    const income = buildIncome({
      buckets: dashboard.incomes,
      dashboard,
      localeTag: "en-US",
    });

    expect(income[0].label).toBe("Nov");
    expect(income[0].received).toBe(128430);
    expect(income[0].planned).toBe(41000);
    expect(income[0].byType).toEqual(["DIVIDEND"]);
  });
});
