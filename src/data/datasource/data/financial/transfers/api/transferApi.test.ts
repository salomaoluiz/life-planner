import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  TransferAmountInRequired,
  TransferSameAccount,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import createTransfer from "./createTransfer";
import deleteTransfer from "./deleteTransfer";
import getTransfer from "./getTransfer";
import updateTransfer from "./updateTransfer";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

// region mocks
const apiTransfer = {
  amountIn: 92000,
  amountOut: 500000,
  currencyIn: "USD",
  currencyOut: "BRL",
  dateIn: "2026-11-06",
  dateOut: "2026-11-04",
  description: "Send to USD account",
  fee: 350,
  fromAccountId: "acc-1",
  id: "transfer-1",
  paid: true,
  rate: { base: "IN", value: 5.4348 },
  toAccountId: "acc-2",
};
const apiResponse = {
  item: apiTransfer,
  lookups: { categories: {}, tags: {} },
  rows: [
    {
      accountId: "acc-1",
      categoryId: "cat-out",
      currency: "BRL",
      date: "2026-11-04",
      description: "Send to USD account",
      id: "row-out",
      owner: "USER",
      ownerId: "owner-1",
      paid: true,
      transferId: "transfer-1",
      type: "EXPENSE",
      value: 500000,
    },
  ],
};
const createParams = {
  amountIn: "920.00",
  amountOut: "5000,00",
  dateIn: new Date(2026, 10, 6).toISOString(),
  dateOut: new Date(2026, 10, 4).toISOString(),
  description: "Send to USD account",
  fee: "3.50",
  fromAccountId: "acc-1",
  paid: true,
  toAccountId: "acc-2",
};
// endregion mocks

const spies = {
  delete: jest.mocked(api.delete),
  get: jest.mocked(api.get),
  patch: jest.mocked(api.patch),
  post: jest.mocked(api.post),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createTransfer", () => {
  it("SHOULD POST the amounts in cents AND the dates as calendar days, then map the response", async () => {
    spies.post.mockResolvedValueOnce(apiResponse);

    const result = await createTransfer(createParams);

    expect(spies.post).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\/v1\/finance\/transfers\?today=\d{4}-\d{2}-\d{2}$/,
      ),
      expect.objectContaining({
        amountIn: 92000,
        amountOut: 500000,
        dateIn: "2026-11-06",
        dateOut: "2026-11-04",
        fee: 350,
        fromAccountId: "acc-1",
        paid: true,
        toAccountId: "acc-2",
      }),
    );
    expect(result.transfer).toMatchObject({
      amountIn: "920.00",
      amountOut: "5000.00",
      currencyIn: "USD",
      fee: "3.50",
      rate: { base: "IN", value: 5.4348 },
    });
    expect(result.rows[0]).toMatchObject({ id: "row-out", value: "5000.00" });
  });

  it("SHOULD send the series options with the end date as a calendar day", async () => {
    spies.post.mockResolvedValueOnce(apiResponse);

    await createTransfer({
      ...createParams,
      recurrence: {
        endDate: new Date(2027, 10, 4).toISOString(),
        frequency: "MONTHLY",
      },
    });

    expect(spies.post.mock.calls[0][1]).toMatchObject({
      recurrence: { endDate: "2027-11-04", frequency: "MONTHLY" },
    });
  });

  it("SHOULD leave the optional fields out", async () => {
    spies.post.mockResolvedValueOnce(apiResponse);

    await createTransfer({
      amountOut: "10.00",
      dateOut: createParams.dateOut,
      description: "x",
      fromAccountId: "a",
      paid: false,
      toAccountId: "b",
    });

    expect(spies.post.mock.calls[0][1]).toMatchObject({
      amountIn: undefined,
      dateIn: undefined,
      fee: undefined,
      recurrence: undefined,
    });
  });

  it("SHOULD throw FieldInvalid BEFORE any request WHEN the amount is not valid", async () => {
    await expect(
      createTransfer({ ...createParams, amountOut: "abc" }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(spies.post).not.toHaveBeenCalled();
  });

  it.each([
    ["TRANSFER_SAME_ACCOUNT", TransferSameAccount],
    ["TRANSFER_AMOUNT_IN_REQUIRED", TransferAmountInRequired],
  ])("SHOULD map the 422 %s", async (message, ErrorClass) => {
    spies.post.mockRejectedValueOnce(new ApiBusinessError(message, 422));

    await expect(createTransfer(createParams)).rejects.toBeInstanceOf(
      ErrorClass,
    );
  });
});

describe("updateTransfer", () => {
  it("SHOULD PATCH only the sent fields AND remove the fee with null", async () => {
    spies.patch.mockResolvedValueOnce(apiResponse);

    await updateTransfer({
      amountOut: "400.00",
      fee: null,
      id: "transfer-1",
      scope: "THIS_AND_NEXT",
    });

    expect(spies.patch).toHaveBeenCalledWith(
      "/v1/finance/transfers/transfer-1",
      expect.objectContaining({
        amountOut: 40000,
        fee: null,
        scope: "THIS_AND_NEXT",
      }),
    );
    expect(spies.patch.mock.calls[0][1]).toMatchObject({
      amountIn: undefined,
      dateOut: undefined,
    });
  });

  it("SHOULD convert a fee, the dates AND the amount in", async () => {
    spies.patch.mockResolvedValueOnce(apiResponse);

    await updateTransfer({
      amountIn: "10.00",
      dateIn: new Date(2026, 10, 7).toISOString(),
      dateOut: new Date(2026, 10, 5).toISOString(),
      fee: "1.00",
      id: "transfer-1",
    });

    expect(spies.patch.mock.calls[0][1]).toMatchObject({
      amountIn: 1000,
      dateIn: "2026-11-07",
      dateOut: "2026-11-05",
      fee: 100,
    });
  });

  it("SHOULD throw FinancialNotFound WHEN the API answers 404", async () => {
    spies.patch.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

    await expect(updateTransfer({ id: "transfer-1" })).rejects.toBeInstanceOf(
      FinancialNotFound,
    );
  });
});

describe("deleteTransfer", () => {
  it("SHOULD DELETE by id, with the scope of a series occurrence", async () => {
    spies.delete.mockResolvedValue(undefined);

    await deleteTransfer({ id: "transfer-1" });
    await deleteTransfer({ id: "transfer-1", scope: "THIS_AND_NEXT" });

    expect(spies.delete).toHaveBeenNthCalledWith(
      1,
      "/v1/finance/transfers/transfer-1",
    );
    expect(spies.delete).toHaveBeenNthCalledWith(
      2,
      "/v1/finance/transfers/transfer-1?scope=THIS_AND_NEXT",
    );
  });

  it("SHOULD throw FinancialNotFound WHEN the API answers 404", async () => {
    spies.delete.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

    await expect(deleteTransfer({ id: "transfer-1" })).rejects.toBeInstanceOf(
      FinancialNotFound,
    );
  });
});

describe("getTransfer", () => {
  it("SHOULD GET the transfer AND map it", async () => {
    spies.get.mockResolvedValueOnce(apiResponse);

    const result = await getTransfer("transfer-1");

    expect(spies.get).toHaveBeenCalledWith("/v1/finance/transfers/transfer-1");
    expect(result.transfer.id).toBe("transfer-1");
  });

  it("SHOULD throw FinancialNotFound WHEN the API answers 404", async () => {
    spies.get.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

    await expect(getTransfer("transfer-1")).rejects.toBeInstanceOf(
      FinancialNotFound,
    );
  });
});
