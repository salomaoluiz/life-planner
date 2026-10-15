import { apiCardInvoice } from "@data/models/financial/mocks/CardInvoice.mocks";
import {
  ApiBusinessError,
  FinancialNotFound,
  GenericError,
  InvoiceNotPayable,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import getCardInvoice from "./getCardInvoice";
import getCardInvoicesForMonth from "./getCardInvoicesForMonth";
import payInvoice from "./payInvoice";
import undoInvoicePayment from "./undoInvoicePayment";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

const key = { creditCardId: "card-1", month: "2026-10" };

async function capture(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 2, 12) });
});
afterEach(() => jest.useRealTimers());

describe("getCardInvoicesForMonth", () => {
  it("SHOULD GET the invoices of the month with the owners and the local today", async () => {
    jest.mocked(api.get).mockResolvedValueOnce([apiCardInvoice]);

    const result = await getCardInvoicesForMonth({
      month: "2026-11",
      ownerIds: ["a", "b"],
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/invoices?ownerId=a&ownerId=b&month=2026-11&today=2026-11-02",
    );
    expect(result[0].invoice.amount).toBe(45000);
  });

  it("SHOULD NOT call the API WITHOUT owners", async () => {
    expect(
      await getCardInvoicesForMonth({ month: "2026-11", ownerIds: [] }),
    ).toEqual([]);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("SHOULD wrap unknown errors in GenericError", async () => {
    jest.mocked(api.get).mockRejectedValueOnce(new Error("boom"));

    expect(
      await capture(
        getCardInvoicesForMonth({ month: "2026-11", ownerIds: ["a"] }),
      ),
    ).toBeInstanceOf(GenericError);
  });
});

describe("getCardInvoice", () => {
  it("SHOULD GET one invoice AND map 404 to FinancialNotFound", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiCardInvoice);

    expect((await getCardInvoice(key)).purchases).toHaveLength(1);
    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/invoices/2026-10?today=2026-11-02",
    );

    jest.mocked(api.get).mockRejectedValueOnce(new ApiBusinessError("x", 404));
    expect(await capture(getCardInvoice(key))).toBeInstanceOf(
      FinancialNotFound,
    );
  });
});

describe("payInvoice", () => {
  it("SHOULD POST the payment with the method, account and paid-on date", async () => {
    await payInvoice({
      ...key,
      accountId: "acc-1",
      method: "ACCOUNT",
      paidOn: "2026-11-05",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/invoices/2026-10/payment?today=2026-11-02",
      { accountId: "acc-1", method: "ACCOUNT", paidOn: "2026-11-05" },
    );
  });

  it.each([409, 422])("SHOULD map %i to InvoiceNotPayable", async (status) => {
    jest
      .mocked(api.post)
      .mockRejectedValueOnce(new ApiBusinessError("x", status));

    expect(
      await capture(
        payInvoice({ ...key, method: "EXTERNAL", paidOn: "2026-11-05" }),
      ),
    ).toBeInstanceOf(InvoiceNotPayable);
  });
});

describe("undoInvoicePayment", () => {
  it("SHOULD DELETE the payment AND map 404", async () => {
    await undoInvoicePayment(key);
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/invoices/2026-10/payment",
    );

    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("x", 404));
    expect(await capture(undoInvoicePayment(key))).toBeInstanceOf(
      FinancialNotFound,
    );
  });
});
