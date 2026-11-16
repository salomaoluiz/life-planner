import { ApiBusinessError } from "@domain/entities/errors";
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
    { assetClass: "BR_STOCK", share: 0.78, value: 14377003 },
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
    {
      assetClass: "FIXED_INCOME",
      assetId: "asset-2",
      currency: "BRL",
      name: "CDB",
      openResult: 10000,
      openResultPercent: null,
      share: 0.1,
      ticker: null,
      value: 1010000,
      valueKind: "FIXED_INCOME_NET",
    },
  ],
  series: [
    { date: "2025-12-31", invested: null, marketValue: null },
    { date: "2026-01-31", invested: 11200000, marketValue: 12000000 },
  ],
  summary: {
    assetsWithoutValue: 1,
    currentValue: 18432055,
    historyStartsAt: "2025-08-04",
    incomePlanned: 41000,
    incomeReceived: 984620,
    invested: 16290000,
    openResult: 2142055,
    openResultPercent: 0.1315,
    operationsWithoutFxRate: 2,
    realizedResult: 318040,
    salesCount: 4,
    staleQuotes: 3,
  },
};

describe("getDashboard (spec 110)", () => {
  it("SHOULD send every owner, the period AND the local date, then map the whole response", async () => {
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
    expect(dashboard.period).toEqual(apiDashboard.period);
    expect(dashboard.summary).toEqual(apiDashboard.summary);
    expect(dashboard.series).toEqual(apiDashboard.series);
    expect(dashboard.incomes).toEqual(apiDashboard.incomes);
  });

  it("SHOULD keep the null points of a bucket before the first operation", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiDashboard);

    const { series } = await investmentApi.getDashboard({
      from: "2025-12-01",
      ownerIds: ["owner-1"],
      to: "2026-11-04",
      today: "2026-11-04",
    });

    expect(series[0]).toEqual({
      date: "2025-12-31",
      invested: null,
      marketValue: null,
    });
  });

  it("SHOULD map the USD detail only where the API sends it AND keep a null ticker", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiDashboard);

    const { allocation, ranking } = await investmentApi.getDashboard({
      from: "2025-12-01",
      ownerIds: ["owner-1"],
      to: "2026-11-04",
      today: "2026-11-04",
    });

    expect(allocation[0].usd).toEqual(apiDashboard.allocation[0].usd);
    expect(allocation[1].usd).toBeUndefined();
    expect(ranking[0]).toMatchObject({ ticker: "AAPL", usdValue: "4628.00" });
    expect(ranking[1].ticker).toBeNull();
    expect(ranking[1].usdValue).toBeUndefined();
    expect(ranking[1].openResultPercent).toBeNull();
    expect(ranking[1].valueKind).toBe("FIXED_INCOME_NET");
  });

  it("SHOULD rethrow an API failure with the datasource context", async () => {
    jest
      .mocked(api.get)
      .mockRejectedValueOnce(new ApiBusinessError("Forbidden", 403, {}, {}));

    await expect(
      investmentApi.getDashboard({
        from: "2025-12-01",
        ownerIds: ["x"],
        to: "2026-11-04",
        today: "2026-11-04",
      }),
    ).rejects.toBeDefined();
  });
});
