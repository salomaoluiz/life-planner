import { ApiBusinessError, QuoteRefreshTooSoon } from "@domain/entities/errors";
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

const apiSummary = {
  cdi: {
    annual: "14.90",
    daily: "0.05513100",
    date: "2026-11-11",
    followers: 4,
    lastChangeDate: "2026-06-18",
    stale: false,
  },
  fx: [{ pair: "USD-BRL", quotedAt: "2026-11-12T11:05:00Z", rate: "5.350000" }],
  ipca: {
    accumulated12m: "4.68",
    expected12m: "4.20",
    expectedDate: "2026-11-11",
    followers: 1,
    month: "2026-10",
    monthly: "0.32",
    stale: true,
  },
  lastSuccessAt: "2026-11-12T13:10:00Z",
  selic: {
    daily: "0.05546000",
    date: "2026-11-11",
    followers: 0,
    lastChangeDate: "2026-06-18",
    stale: false,
    target: "15.00",
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getMarketIndexes (spec 113)", () => {
  it("SHOULD read the summary AND map every index", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiSummary);

    const summary = await investmentApi.getMarketIndexes();

    expect(api.get).toHaveBeenCalledWith("/v1/investments/market-indexes");
    expect(summary).toEqual(apiSummary);
  });

  it("SHOULD keep null indexes BEFORE the first run", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      cdi: null,
      fx: [],
      ipca: null,
      lastSuccessAt: null,
      selic: null,
    });

    expect(await investmentApi.getMarketIndexes()).toEqual({
      cdi: null,
      fx: [],
      ipca: null,
      lastSuccessAt: null,
      selic: null,
    });
  });

  it("SHOULD default missing values AND wrap a failure", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      cdi: { date: "2026-11-11" },
      ipca: { stale: false },
      selic: { date: "2026-11-11" },
    });

    const summary = await investmentApi.getMarketIndexes();

    expect(summary.cdi).toMatchObject({
      annual: null,
      followers: 0,
      stale: false,
    });
    expect(summary.ipca).toMatchObject({ month: null, monthly: null });
    expect(summary.selic).toMatchObject({ target: null });
    expect(summary.fx).toEqual([]);

    jest.mocked(api.get).mockRejectedValueOnce(new Error("down"));
    await expect(investmentApi.getMarketIndexes()).rejects.toBeDefined();
  });
});

describe("getMarketIndexHistory (spec 113)", () => {
  it("SHOULD send the period AND map the step points, the changes AND the followers", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      changes: [{ delta: "0.75", since: "2026-06-18", value: "14.90" }],
      followers: [{ assetId: "a", name: "CDB", percent: "110" }],
      index: "CDI",
      points: [{ date: "2026-06-18", value: "14.90" }],
    });

    const history = await investmentApi.getMarketIndexHistory({
      from: "2025-11-12",
      index: "CDI",
      to: "2026-11-12",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/investments/market-indexes/CDI/history?from=2025-11-12&to=2026-11-12",
    );
    expect(history.changes[0]).toEqual({
      delta: "0.75",
      since: "2026-06-18",
      value: "14.90",
    });
    expect(history.followers[0]).toMatchObject({ name: "CDB", percent: "110" });
    expect(history.points[0]).toMatchObject({
      date: "2026-06-18",
      value: "14.90",
    });
  });

  it("SHOULD map the monthly points of the IPCA", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      changes: [],
      followers: [{ assetId: "b", name: "NTN", spread: "6" }],
      index: "IPCA",
      points: [{ accumulated12m: "4.63", month: "2026-10", monthly: "0.14" }],
    });

    const history = await investmentApi.getMarketIndexHistory({
      from: "2025-11-12",
      index: "IPCA",
      to: "2026-11-12",
    });

    expect(history.points[0]).toMatchObject({
      accumulated12m: "4.63",
      month: "2026-10",
    });
    expect(history.followers[0].spread).toBe("6");

    jest.mocked(api.get).mockRejectedValueOnce(new Error("down"));
    await expect(
      investmentApi.getMarketIndexHistory({
        from: "a",
        index: "IPCA",
        to: "b",
      }),
    ).rejects.toBeDefined();
  });
});

describe("refreshMarketIndexes (spec 113)", () => {
  it("SHOULD post the refresh AND map the new summary", async () => {
    jest.mocked(api.post).mockResolvedValueOnce(apiSummary);

    expect(await investmentApi.refreshMarketIndexes()).toEqual(apiSummary);
    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/market-indexes/refresh",
      {},
    );
  });

  it("SHOULD map the 429 of the minute limit to QuoteRefreshTooSoon", async () => {
    jest.mocked(api.post).mockRejectedValueOnce(
      new ApiBusinessError(
        "Wait 1 minute to refresh again",
        429,
        {},
        {
          code: "REFRESH_TOO_SOON",
          retryAfterSeconds: 42,
        },
      ),
    );

    await expect(investmentApi.refreshMarketIndexes()).rejects.toBeInstanceOf(
      QuoteRefreshTooSoon,
    );
  });
});
