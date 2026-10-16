import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  GenericError,
  HasRefunds,
  InvoiceIsPaid,
  OverAmountDue,
  RefundOverPurchase,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import createEarlyPayment from "./createEarlyPayment";
import createRefund from "./createRefund";
import deleteEarlyPayment from "./deleteEarlyPayment";
import deleteRefund from "./deleteRefund";
import updateEarlyPayment from "./updateEarlyPayment";
import updateRefund from "./updateRefund";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

async function capture(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 9, 16, 12) });
});
afterEach(() => jest.useRealTimers());

const refund = {
  creditCardId: "card-1",
  date: "2026-10-16",
  description: "Refund · Notebook",
  invoiceMonth: "2026-10",
  refundedTransactionId: "purchase-1",
  value: 50000,
};
const early = {
  accountId: "acc-1",
  creditCardId: "card-1",
  date: "2026-10-16",
  description: "Early payment",
  invoiceMonth: "2026-10",
  method: "ACCOUNT" as const,
  value: 60000,
};

describe("refunds", () => {
  it("SHOULD POST the refund in cents with today", async () => {
    await createRefund(refund);

    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/refunds?today=2026-10-16",
      {
        date: "2026-10-16",
        description: "Refund · Notebook",
        invoiceMonth: "2026-10",
        refundedPlanId: undefined,
        refundedTransactionId: "purchase-1",
        value: 50000,
      },
    );
  });

  it("SHOULD PATCH and DELETE a refund by id", async () => {
    await updateRefund({ creditCardId: "card-1", id: "r1", value: 10 });
    await deleteRefund({ creditCardId: "card-1", id: "r1" });

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/refunds/r1?today=2026-10-16",
      expect.objectContaining({ value: 10 }),
    );
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/refunds/r1",
    );
  });

  it("SHOULD map the 400/404/422 answers", async () => {
    jest.mocked(api.post).mockRejectedValueOnce(new ApiBusinessError("x", 400));
    expect(await capture(createRefund(refund))).toBeInstanceOf(FieldInvalid);

    jest.mocked(api.post).mockRejectedValueOnce(new ApiBusinessError("x", 404));
    expect(await capture(createRefund(refund))).toBeInstanceOf(
      FinancialNotFound,
    );

    jest
      .mocked(api.post)
      .mockRejectedValueOnce(new ApiBusinessError("Invoice is paid", 422));
    expect(await capture(createRefund(refund))).toBeInstanceOf(InvoiceIsPaid);

    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        new ApiBusinessError("Refunds can't exceed the purchase value", 422),
      );
    expect(await capture(createRefund(refund))).toBeInstanceOf(
      RefundOverPurchase,
    );

    jest.mocked(api.post).mockRejectedValueOnce(new Error("boom"));
    expect(await capture(createRefund(refund))).toBeInstanceOf(GenericError);
  });

  it("SHOULD map a refund delete blocked by a paid invoice", async () => {
    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("Invoice is paid", 422));

    expect(
      await capture(deleteRefund({ creditCardId: "card-1", id: "r1" })),
    ).toBeInstanceOf(InvoiceIsPaid);
    jest
      .mocked(api.patch)
      .mockRejectedValueOnce(
        new ApiBusinessError("Delete its refunds first", 422),
      );
    expect(
      await capture(updateRefund({ creditCardId: "card-1", id: "r1" })),
    ).toBeInstanceOf(HasRefunds);
  });
});

describe("early payments", () => {
  it("SHOULD POST the early payment with the method and the account", async () => {
    await createEarlyPayment(early);

    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/early-payments?today=2026-10-16",
      {
        accountId: "acc-1",
        date: "2026-10-16",
        description: "Early payment",
        invoiceMonth: "2026-10",
        method: "ACCOUNT",
        value: 60000,
      },
    );
  });

  it("SHOULD PATCH and DELETE an early payment by id", async () => {
    await updateEarlyPayment({
      creditCardId: "card-1",
      id: "e1",
      method: "EXTERNAL",
    });
    await deleteEarlyPayment({ creditCardId: "card-1", id: "e1" });

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/early-payments/e1?today=2026-10-16",
      expect.objectContaining({ method: "EXTERNAL" }),
    );
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/card-1/early-payments/e1",
    );
  });

  it("SHOULD map a value over the amount due", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        new ApiBusinessError("The value can't exceed what is left to pay", 422),
      );

    expect(await capture(createEarlyPayment(early))).toBeInstanceOf(
      OverAmountDue,
    );
    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("Invoice is paid", 422));
    expect(
      await capture(deleteEarlyPayment({ creditCardId: "card-1", id: "e1" })),
    ).toBeInstanceOf(InvoiceIsPaid);
  });
});
