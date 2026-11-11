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

const apiSummary = {
  currency: "BRL",
  currentValueCents: 18432055,
  hasPositions: true,
  income: {
    count: 6,
    month: "2026-11",
    pendingSuggestions: 2,
    totalCents: 128430,
  },
  investedCents: 16290000,
  nextMaturity: {
    assetId: "asset-1",
    currency: "BRL",
    maturityDate: "2026-12-15",
    name: "CDB",
    netEstimatedCents: 2187010,
  },
  quotes: {
    asOf: "2026-11-04T19:05:00.000Z",
    manualCount: 2,
    stale: false,
    withoutPrice: 0,
  },
  resultBasisPoints: 1315,
  resultCents: 2142055,
};

beforeEach(() => jest.clearAllMocks());

describe("getHomeSummary (spec 109)", () => {
  it("SHOULD send every owner and the local date, AND map the contract", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiSummary);

    const summary = await investmentApi.getHomeSummary({
      ownerIds: ["owner-1", "owner-2"],
      today: "2026-11-04",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/investments/summary?ownerId=owner-1&ownerId=owner-2&today=2026-11-04",
    );
    expect(summary).toEqual({
      currentValueCents: 18432055,
      hasPositions: true,
      income: {
        count: 6,
        month: "2026-11",
        pendingSuggestions: 2,
        totalCents: 128430,
      },
      investedCents: 16290000,
      nextMaturity: {
        assetId: "asset-1",
        currency: "BRL",
        maturityDate: "2026-12-15",
        name: "CDB",
        netEstimatedCents: 2187010,
      },
      quotes: {
        asOf: new Date("2026-11-04T19:05:00.000Z"),
        manualCount: 2,
        stale: false,
        withoutPrice: 0,
      },
      resultBasisPoints: 1315,
      resultCents: 2142055,
    });
  });

  it("SHOULD leave the optional fields undefined WHEN the API sends nulls", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      ...apiSummary,
      hasPositions: false,
      nextMaturity: null,
      quotes: { ...apiSummary.quotes, asOf: null },
      resultBasisPoints: null,
    });

    const summary = await investmentApi.getHomeSummary({
      ownerIds: ["owner-1"],
      today: "2026-11-04",
    });

    expect(summary.nextMaturity).toBeUndefined();
    expect(summary.quotes.asOf).toBeUndefined();
    expect(summary.resultBasisPoints).toBeUndefined();
    expect(summary.hasPositions).toBe(false);
  });

  it("SHOULD rethrow an API failure with the datasource context", async () => {
    jest
      .mocked(api.get)
      .mockRejectedValueOnce(new ApiBusinessError("Forbidden", 403, {}, {}));

    await expect(
      investmentApi.getHomeSummary({ ownerIds: ["x"], today: "2026-11-04" }),
    ).rejects.toBeDefined();
  });
});
