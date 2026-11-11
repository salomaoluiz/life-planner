import {
  ApiBusinessError,
  FieldInvalid,
  InvestmentCurrencyMismatch,
  InvestmentIncomeIncomplete,
  InvestmentIncomeLocked,
  InvestmentIncomeReceived,
} from "@domain/entities/errors";
import {
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

const apiIncome = {
  accountId: "acc-1",
  amountPerUnit: "0.28",
  assetId: "asset-1",
  categoryId: "cat-1",
  currency: "BRL",
  estimatedGross: 8400,
  estimatedWithheld: 1260,
  exDate: "2026-09-10",
  id: "inc-1",
  netAmount: 7140,
  overdue: false,
  paymentDate: "2026-10-30",
  quantity: "300",
  status: "RECEIVED",
  transactionId: "tx-1",
  type: "JCP",
  withholdingRate: "0.15",
};
const fields = {
  accountId: "acc-1",
  amountPerUnit: "0,28",
  categoryId: "cat-1",
  exDate: "2026-09-10",
  netAmount: 7140,
  paymentDate: "2026-10-30",
  quantity: "300",
  status: InvestmentIncomeStatus.RECEIVED,
  type: InvestmentIncomeType.JCP,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("writes", () => {
  it("SHOULD create with normalized decimals AND map the income", async () => {
    jest.mocked(api.post).mockResolvedValue({ item: apiIncome });

    const income = await investmentApi.createIncome({
      ...fields,
      assetId: "asset-1",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/incomes",
      expect.objectContaining({
        amountPerUnit: "0.28",
        assetId: "asset-1",
        netAmount: 7140,
        quantity: "300",
        status: "RECEIVED",
      }),
    );
    expect(income).toMatchObject({
      estimatedGross: 8400,
      id: "inc-1",
      overdue: false,
      status: "RECEIVED",
      transactionId: "tx-1",
      withholdingRate: "0.15",
    });
  });

  it("SHOULD refuse a quantity or a per-unit value that is not above zero BEFORE any call", async () => {
    await expect(
      investmentApi.createIncome({ ...fields, assetId: "a", quantity: "0" }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      investmentApi.updateIncome({ amountPerUnit: "abc", id: "inc-1" }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it("SHOULD send null to clear an optional field AND leave an absent one out of the edit", async () => {
    jest.mocked(api.patch).mockResolvedValue({ item: apiIncome });

    await investmentApi.updateIncome({
      amountPerUnit: null,
      exDate: null,
      id: "inc-1",
      netAmount: 7000,
    });

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/investments/incomes/inc-1",
      expect.objectContaining({
        amountPerUnit: null,
        exDate: null,
        netAmount: 7000,
        quantity: undefined,
      }),
    );
  });

  it("SHOULD receive, approve, reject AND delete", async () => {
    jest.mocked(api.post).mockResolvedValue({ item: apiIncome });

    await investmentApi.receiveIncome({
      id: "inc-1",
      netAmount: 7215,
      receivedOn: "2026-11-04",
    });
    await investmentApi.approveIncomeSuggestion({ id: "sug-1", netAmount: 1 });
    await investmentApi.rejectIncomeSuggestion("sug-1");
    await investmentApi.deleteIncome("inc-1");

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/incomes/inc-1/receive",
      { accountId: undefined, netAmount: 7215, receivedOn: "2026-11-04" },
    );
    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/income-suggestions/sug-1/approve",
      expect.objectContaining({ netAmount: 1 }),
    );
    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/income-suggestions/sug-1/reject",
      {},
    );
    expect(api.delete).toHaveBeenCalledWith("/v1/investments/incomes/inc-1");
  });
});

describe("reads", () => {
  it("SHOULD read one income AND the defaults with their query", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({ item: apiIncome });
    jest.mocked(api.get).mockResolvedValueOnce({
      accountId: "acc-1",
      categoryId: null,
      currency: "BRL",
      quantity: "300",
      withholdingRate: "0.15",
    });

    expect((await investmentApi.getIncome("inc-1")).id).toBe("inc-1");
    expect(
      await investmentApi.getIncomeDefaults({
        assetId: "asset-1",
        exDate: "2026-09-10",
        type: InvestmentIncomeType.JCP,
      }),
    ).toEqual({
      accountId: "acc-1",
      categoryId: null,
      currency: "BRL",
      quantity: "300",
      withholdingRate: "0.15",
    });
    expect(api.get).toHaveBeenLastCalledWith(
      "/v1/investments/assets/asset-1/income-defaults?exDate=2026-09-10&type=JCP",
    );
  });

  it("SHOULD page the incomes with the filters AND the summary", async () => {
    jest.mocked(api.get).mockResolvedValue({
      items: [apiIncome],
      nextCursor: "c2",
      summary: {
        currency: "BRL",
        pendingSuggestions: 2,
        plannedTotal: 14100,
        receivedThisYear: 128460,
      },
    });

    const page = await investmentApi.getIncomes({
      assetId: "asset-1",
      cursor: "c1",
      limit: 20,
      status: InvestmentIncomeStatus.PLANNED,
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/investments/incomes?assetId=asset-1&cursor=c1&limit=20&status=PLANNED",
    );
    expect(page.nextCursor).toBe("c2");
    expect(page.summary).toEqual({
      currency: "BRL",
      pendingSuggestions: 2,
      plannedTotal: 14100,
      receivedThisYear: 128460,
    });
  });

  it("SHOULD map the suggestions AND call without a query WHEN there is no filter", async () => {
    jest.mocked(api.get).mockResolvedValue({
      count: 1,
      items: [
        {
          amountPerUnit: "0.47",
          assetId: "asset-1",
          canApproveDirectly: true,
          currency: "BRL",
          estimatedGross: 14100,
          estimatedNet: 14100,
          exDate: "2026-11-21",
          id: "sug-1",
          paymentDate: "2026-12-19",
          quantity: "300",
          ticker: "PETR4",
          type: "DIVIDEND",
          withholdingRate: "0",
        },
      ],
    });

    const [suggestion] = await investmentApi.getIncomeSuggestions({});

    expect(api.get).toHaveBeenCalledWith("/v1/investments/income-suggestions");
    expect(suggestion).toMatchObject({
      canApproveDirectly: true,
      estimatedNet: 14100,
      ticker: "PETR4",
    });
  });

  it("SHOULD find the income behind a finance row, or undefined", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      investment: { assetId: "asset-1", incomeId: "inc-1" },
    });
    jest.mocked(api.get).mockResolvedValueOnce({
      investment: { assetId: "asset-1", operationId: "op-1" },
    });
    jest.mocked(api.get).mockResolvedValueOnce({});

    expect(await investmentApi.getIncomeLink("tx-1")).toEqual({
      assetId: "asset-1",
      incomeId: "inc-1",
    });
    expect(await investmentApi.getIncomeLink("tx-2")).toBeUndefined();
    expect(await investmentApi.getIncomeLink("tx-3")).toBeUndefined();
  });
});

describe("errors", () => {
  it.each([
    [422, "CURRENCY_MISMATCH", InvestmentCurrencyMismatch],
    [422, "EXTERNALLY_LOCKED", InvestmentIncomeLocked],
    [409, "ALREADY_RECEIVED", InvestmentIncomeReceived],
  ])("SHOULD map %s %s", async (status, code, expected) => {
    jest
      .mocked(api.post)
      .mockRejectedValue(new ApiBusinessError("x", status, {}, { code }));

    await expect(
      investmentApi.receiveIncome({ id: "inc-1" }),
    ).rejects.toBeInstanceOf(expected);
  });

  it("SHOULD map INCOME_INCOMPLETE with the missing fields", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValue(
        new ApiBusinessError(
          "x",
          422,
          {},
          { code: "INCOME_INCOMPLETE", missing: ["paymentDate"] },
        ),
      );

    await expect(
      investmentApi.approveIncomeSuggestion({ id: "sug-1" }),
    ).rejects.toMatchObject({
      constructor: InvestmentIncomeIncomplete,
      missing: ["paymentDate"],
    });
  });

  it("SHOULD map an INCOME_INCOMPLETE without the list to no missing fields", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValue(
        new ApiBusinessError("x", 422, {}, { code: "INCOME_INCOMPLETE" }),
      );

    await expect(
      investmentApi.approveIncomeSuggestion({ id: "sug-1" }),
    ).rejects.toMatchObject({ missing: [] });
  });
});
