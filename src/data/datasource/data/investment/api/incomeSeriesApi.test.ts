import {
  ApiBusinessError,
  FieldInvalid,
  InvestmentNoPositionAtStart,
  InvestmentTooManyOccurrences,
} from "@domain/entities/errors";
import {
  InvestmentIncomeScope,
  InvestmentIncomeSeriesEndReason,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";
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

const apiSeries = {
  accountId: "acc-1",
  amountPerUnit: "1.1",
  assetId: "asset-1",
  categoryId: "cat-1",
  currency: "BRL",
  endedAt: "2026-09-15",
  endReason: "POSITION_ZERO",
  exDateOffsetDays: 8,
  firstPaymentDate: "2025-01-15",
  frequency: { interval: 1, unit: "MONTH" },
  id: "series-1",
  lastGeneratedNumber: 23,
  nextPaymentDate: "2026-12-15",
  type: "YIELD",
  withFinance: true,
};
const params = {
  accountId: "acc-1",
  amountPerUnit: "1,10",
  assetId: "asset-1",
  categoryId: "cat-1",
  exDateOffsetDays: 8,
  firstPaymentDate: "2025-01-15",
  frequency: { interval: 1, unit: "MONTH" as const },
  type: InvestmentIncomeType.YIELD,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("create and preview", () => {
  it("SHOULD post the series with the amount normalized AND map the counts", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      created: { planned: 1, received: 22 },
      item: apiSeries,
    });

    const result = await investmentApi.createIncomeSeries({
      ...params,
      markPastAsReceived: true,
      withFinance: true,
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/income-series",
      expect.objectContaining({
        accountId: "acc-1",
        amountPerUnit: "1.1",
        markPastAsReceived: true,
      }),
    );
    expect(result.created).toEqual({ planned: 1, received: 22 });
    expect(result.series).toMatchObject({
      endReason: InvestmentIncomeSeriesEndReason.POSITION_ZERO,
      frequency: { interval: 1, unit: "MONTH" },
      id: "series-1",
      nextPaymentDate: "2026-12-15",
    });
  });

  it("SHOULD send no account or category WITHOUT finance", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      created: { planned: 0, received: 0 },
      item: { ...apiSeries, accountId: undefined, withFinance: false },
    });

    await investmentApi.createIncomeSeries({ ...params, withFinance: false });

    const body = (api.post as jest.Mock).mock.calls[0][1];

    expect(body.accountId).toBeUndefined();
    expect(body.categoryId).toBeUndefined();
    expect(body.withFinance).toBe(false);
  });

  it("SHOULD refuse a bad amount before calling AND map the preview", async () => {
    await expect(
      investmentApi.createIncomeSeries({ ...params, amountPerUnit: "0" }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();

    (api.post as jest.Mock).mockResolvedValue({
      endsByPosition: null,
      firstNetAmount: 11000,
      firstQuantity: "100",
      next: ["2026-12-15"],
      occurrences: { currentMonth: 1, max: 600, past: 22 },
    });

    expect(await investmentApi.previewIncomeSeries(params)).toEqual({
      endsByPosition: null,
      firstNetAmount: 11000,
      firstQuantity: "100",
      next: ["2026-12-15"],
      occurrences: { currentMonth: 1, max: 600, past: 22 },
    });
    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/income-series/preview",
      expect.anything(),
    );
  });

  it("SHOULD map the rule errors of the API (spec 115 FR 12, 16)", async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(
      new ApiBusinessError(
        "x",
        422,
        {},
        {
          code: "NO_POSITION_AT_START",
          details: { firstBuyDate: "2024-12-01" },
        },
      ),
    );
    await expect(
      investmentApi.previewIncomeSeries(params),
    ).rejects.toMatchObject(new InvestmentNoPositionAtStart("2024-12-01"));

    (api.post as jest.Mock).mockRejectedValueOnce(
      new ApiBusinessError(
        "x",
        422,
        {},
        {
          code: "NO_POSITION_AT_START",
          details: {},
        },
      ),
    );
    await expect(
      investmentApi.previewIncomeSeries(params),
    ).rejects.toMatchObject({
      firstBuyDate: null,
    });

    (api.post as jest.Mock).mockRejectedValueOnce(
      new ApiBusinessError(
        "x",
        422,
        {},
        {
          code: "TOO_MANY_OCCURRENCES",
          details: { count: 729, max: 600 },
        },
      ),
    );
    await expect(
      investmentApi.createIncomeSeries(params),
    ).rejects.toMatchObject(new InvestmentTooManyOccurrences(729, 600));
  });
});

describe("reads and updates", () => {
  it("SHOULD read the series of an asset, by id AND the projections", async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce({ items: [apiSeries] })
      .mockResolvedValueOnce({ item: apiSeries })
      .mockResolvedValueOnce({
        items: [
          {
            assetId: "asset-1",
            assetLabel: "HGLG11",
            currency: "BRL",
            exDate: "2026-12-07",
            netAmount: 11000,
            number: 24,
            paymentDate: "2026-12-15",
            quantity: "100",
            seriesId: "series-1",
            type: "YIELD",
            withFinance: true,
          },
        ],
      });

    expect((await investmentApi.getIncomeSeries("asset-1"))[0].id).toBe(
      "series-1",
    );
    expect((await investmentApi.getIncomeSeriesById("series-1")).id).toBe(
      "series-1",
    );
    expect(
      await investmentApi.getIncomeSeriesProjections({
        from: "2026-12-01",
        to: "2027-02-28",
      }),
    ).toEqual([
      expect.objectContaining({ number: 24, paymentDate: "2026-12-15" }),
    ]);
    expect(api.get).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/income-series?assetId=asset-1",
    );
    expect(api.get).toHaveBeenNthCalledWith(
      3,
      "/v1/investments/income-series/projections?from=2026-12-01&to=2027-02-28",
    );
  });

  it("SHOULD patch the series with a normalized amount AND leave an unset one alone", async () => {
    (api.patch as jest.Mock).mockResolvedValue({ item: apiSeries });

    await investmentApi.updateIncomeSeries({
      amountPerUnit: "1,15",
      endDate: null,
      id: "series-1",
    });
    await investmentApi.updateIncomeSeries({ id: "series-1", notes: "x" });

    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/income-series/series-1",
      expect.objectContaining({ amountPerUnit: "1.15", endDate: null }),
    );
    expect(
      (api.patch as jest.Mock).mock.calls[1][1].amountPerUnit,
    ).toBeUndefined();
  });

  it("SHOULD wrap the failures of every read and write", async () => {
    const failure = new ApiBusinessError("boom", 500, {}, {});

    (api.get as jest.Mock).mockRejectedValue(failure);
    (api.patch as jest.Mock).mockRejectedValue(failure);

    await expect(investmentApi.getIncomeSeries("a")).rejects.toBeDefined();
    await expect(investmentApi.getIncomeSeriesById("a")).rejects.toBeDefined();
    await expect(
      investmentApi.getIncomeSeriesProjections({ from: "a", to: "b" }),
    ).rejects.toBeDefined();
    await expect(
      investmentApi.updateIncomeSeries({ id: "a" }),
    ).rejects.toBeDefined();
  });
});

describe("income scope (spec 115 FR 24-25)", () => {
  it("SHOULD send the scope as a query AND the series fields on the edit", async () => {
    (api.patch as jest.Mock).mockResolvedValue({
      item: { ...apiSeries, occurrenceNumber: 24, seriesId: "series-1" },
    });

    await investmentApi.updateIncome({
      amountPerUnit: "1,15",
      frequency: { interval: 2, unit: "MONTH" },
      id: "inc-1",
      scope: InvestmentIncomeScope.THIS_AND_NEXT,
      status: InvestmentIncomeStatus.PLANNED,
      withFinance: true,
    });
    await investmentApi.deleteIncome({
      id: "inc-1",
      scope: InvestmentIncomeScope.ALL,
    });
    await investmentApi.deleteIncome({ id: "inc-2" });

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/investments/incomes/inc-1?scope=THIS_AND_NEXT",
      expect.objectContaining({
        amountPerUnit: "1.15",
        frequency: { interval: 2, unit: "MONTH" },
        withFinance: true,
      }),
    );
    expect(api.delete).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/incomes/inc-1?scope=ALL",
    );
    expect(api.delete).toHaveBeenNthCalledWith(
      2,
      "/v1/investments/incomes/inc-2",
    );
  });
});
