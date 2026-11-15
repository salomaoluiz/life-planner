import { api } from "@infrastructure/api";

import investmentApi from "./index";

jest.mock("@infrastructure/api", () => ({
  api: {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const apiDashboard = {
  allocation: [
    {
      assetClass: "FOREIGN_STOCK",
      share: 0.22,
      usd: {
        fxRate: "5.5601",
        resultFromAsset: 695403,
        resultFromFx: 217228,
        value: "7293.15",
      },
      value: 4055052,
    },
    { assetClass: "BR_STOCK", share: 0.78, usd: null, value: 14377003 },
  ],
  incomes: [
    {
      byType: { DIVIDEND: 2, INTEREST: 0, JCP: 1, OTHER: 0, YIELD: 3 },
      date: "2026-11-30",
      planned: 41000,
      received: 128430,
    },
  ],
  period: { bucket: "MONTH", from: "2025-12-01", to: "2026-11-04" },
  ranking: [
    {
      assetClass: "FOREIGN_STOCK",
      assetId: "asset-1",
      currency: "USD",
      name: "Apple Inc.",
      openResult: 670779,
      openResultPercent: 0.3525,
      share: 0.1396,
      ticker: "AAPL",
      usdValue: "4628.00",
      value: 2573200,
      valueKind: "QUOTE",
    },
  ],
  series: [
    { date: "2026-10-31", invested: null, marketValue: null },
    { date: "2026-11-04", invested: 16290000, marketValue: 18432055 },
  ],
  summary: {
    assetsWithoutValue: 0,
    currentValue: 18432055,
    historyStartsAt: "2025-08-04",
    incomePlanned: 41000,
    incomeReceived: 984620,
    invested: 16290000,
    openResult: 2142055,
    openResultPercent: 0.1315,
    operationsWithoutFxRate: 0,
    realizedResult: 318040,
    salesCount: 4,
    staleQuotes: 1,
  },
};

beforeEach(() => jest.clearAllMocks());

describe("getDashboard (spec 110)", () => {
  it("SHOULD send the owners and the period, AND map the contract", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiDashboard);

    const dashboard = await investmentApi.getDashboard({
      from: "2025-12-01",
      ownerIds: ["owner-1", "owner-2"],
      to: "2026-11-04",
      today: "2026-11-04",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/investments/dashboard?ownerId=owner-1&ownerId=owner-2&from=2025-12-01&to=2026-11-04&today=2026-11-04",
    );
    expect(dashboard.period).toEqual({
      bucket: "MONTH",
      from: "2025-12-01",
      to: "2026-11-04",
    });
    expect(dashboard.summary).toMatchObject({
      currentValue: 18432055,
      historyStartsAt: "2025-08-04",
      openResultPercent: 0.1315,
      staleQuotes: 1,
    });
    expect(dashboard.series[0]).toEqual({
      date: "2026-10-31",
      invested: undefined,
      marketValue: undefined,
    });
    expect(dashboard.allocation[0].usd).toEqual({
      fxRate: "5.5601",
      resultFromAsset: 695403,
      resultFromFx: 217228,
      value: "7293.15",
    });
    expect(dashboard.ranking[0]).toMatchObject({
      currency: "USD",
      ticker: "AAPL",
      usdValue: "4628.00",
      valueKind: "QUOTE",
    });
    expect(dashboard.incomes[0].byType).toEqual({
      DIVIDEND: 2,
      INTEREST: 0,
      JCP: 1,
      OTHER: 0,
      YIELD: 3,
    });
  });

  it("SHOULD keep the optional numbers out WHEN the API sends null", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      ...apiDashboard,
      allocation: [{ assetClass: "BR_STOCK", share: 1, usd: null, value: 0 }],
      ranking: [
        {
          ...apiDashboard.ranking[0],
          openResultPercent: null,
          ticker: null,
          usdValue: null,
        },
      ],
      summary: {
        ...apiDashboard.summary,
        historyStartsAt: null,
        openResultPercent: null,
      },
    });

    const dashboard = await investmentApi.getDashboard({
      from: "2025-12-01",
      ownerIds: ["owner-1"],
      to: "2026-11-04",
      today: "2026-11-04",
    });

    expect(dashboard.summary.openResultPercent).toBeUndefined();
    expect(dashboard.summary.historyStartsAt).toBeUndefined();
    expect(dashboard.ranking[0].ticker).toBeUndefined();
    expect(dashboard.allocation[0].usd).toBeUndefined();
  });
});
