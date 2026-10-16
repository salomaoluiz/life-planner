import { apiInstallmentPlan } from "@data/models/financial/mocks/InstallmentPlan.mocks";
import { OwnerType } from "@data/models/financial/TransactionModel";
import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  GenericError,
  InstallmentPaid,
  InvoiceIsPaid,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import createInstallmentPlan from "./createInstallmentPlan";
import deleteInstallmentPlan from "./deleteInstallmentPlan";
import getInstallmentPlan from "./getInstallmentPlan";
import prepayInstallmentPlan from "./prepayInstallmentPlan";
import previewPrepayment from "./previewPrepayment";
import undoPrepayment from "./undoPrepayment";
import updateInstallmentPlan from "./updateInstallmentPlan";

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

const createParams = {
  categoryId: "category-1",
  creditCardId: "card-1",
  date: new Date(2026, 9, 20).toISOString(),
  description: "Notebook",
  installments: 10,
  owner: "USER" as OwnerType,
  ownerId: "user-id",
  value: "5120.00",
};

describe("createInstallmentPlan", () => {
  it("SHOULD POST the TOTAL in cents, the calendar date AND the local today", async () => {
    jest.mocked(api.post).mockResolvedValueOnce(apiInstallmentPlan);

    const result = await createInstallmentPlan(createParams);

    expect(api.post).toHaveBeenCalledWith("/v1/finance/installment-plans", {
      categoryId: "category-1",
      creditCardId: "card-1",
      date: "2026-10-20",
      description: "Notebook",
      installments: 10,
      owner: "USER",
      ownerId: "user-id",
      today: "2026-10-16",
      value: 512000,
    });
    expect(result.id).toBe("plan-1");
  });

  it("SHOULD fail with FieldInvalid BEFORE the network WHEN the value is not money", async () => {
    expect(
      await capture(createInstallmentPlan({ ...createParams, value: "abc" })),
    ).toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("SHOULD map 422 to InstallmentPaid AND unknown errors to GenericError", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        new ApiBusinessError("An installment is in a paid invoice", 422),
      );
    expect(await capture(createInstallmentPlan(createParams))).toBeInstanceOf(
      InstallmentPaid,
    );

    jest.mocked(api.post).mockRejectedValueOnce(new Error("boom"));
    expect(await capture(createInstallmentPlan(createParams))).toBeInstanceOf(
      GenericError,
    );
  });
});

describe("getInstallmentPlan", () => {
  it("SHOULD GET the plan with today AND map 404", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiInstallmentPlan);

    expect((await getInstallmentPlan("plan-1")).totalValue).toBe("66.67");
    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/installment-plans/plan-1?today=2026-10-16",
    );

    jest
      .mocked(api.get)
      .mockRejectedValueOnce(new ApiBusinessError("Not found", 404));
    expect(await capture(getInstallmentPlan("plan-1"))).toBeInstanceOf(
      FinancialNotFound,
    );
  });
});

describe("updateInstallmentPlan", () => {
  it("SHOULD PATCH only the sent fields", async () => {
    jest.mocked(api.patch).mockResolvedValueOnce(apiInstallmentPlan);

    await updateInstallmentPlan({ description: "Laptop", id: "plan-1" });

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/finance/installment-plans/plan-1?today=2026-10-16",
      {
        categoryId: undefined,
        creditCardId: undefined,
        date: undefined,
        description: "Laptop",
        installments: undefined,
        value: undefined,
      },
    );
  });

  it("SHOULD convert the new total AND the date WHEN sent", async () => {
    jest.mocked(api.patch).mockResolvedValueOnce(apiInstallmentPlan);

    await updateInstallmentPlan({
      date: new Date(2026, 10, 2).toISOString(),
      id: "plan-1",
      installments: 12,
      value: "120.00",
    });

    expect(jest.mocked(api.patch).mock.calls[0][1]).toEqual(
      expect.objectContaining({
        date: "2026-11-02",
        installments: 12,
        value: 12000,
      }),
    );
  });

  it("SHOULD map 422 to InstallmentPaid", async () => {
    jest
      .mocked(api.patch)
      .mockRejectedValueOnce(
        new ApiBusinessError("An installment is in a paid invoice", 422),
      );

    expect(
      await capture(updateInstallmentPlan({ description: "x", id: "plan-1" })),
    ).toBeInstanceOf(InstallmentPaid);
  });
});

describe("deleteInstallmentPlan", () => {
  it("SHOULD DELETE the plan AND map 422", async () => {
    await deleteInstallmentPlan("plan-1");
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/installment-plans/plan-1",
    );

    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(
        new ApiBusinessError("An installment is in a paid invoice", 422),
      );
    expect(await capture(deleteInstallmentPlan("plan-1"))).toBeInstanceOf(
      InstallmentPaid,
    );
  });
});

describe("prepayment (spec 032)", () => {
  it("SHOULD GET the preview with the target month AND today", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({
      eligible: [
        {
          id: "r4",
          installmentNumber: 4,
          invoiceMonth: "2026-11",
          value: 51200,
        },
      ],
      total: 51200,
    });

    const result = await previewPrepayment({
      planId: "plan-1",
      targetInvoiceMonth: "2026-10",
    });

    expect(result.total).toBe(51200);
    expect(result.eligible[0].installmentNumber).toBe(4);
    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/installment-plans/plan-1/prepayment-preview?targetInvoiceMonth=2026-10&today=2026-10-16",
    );
  });

  it("SHOULD POST the prepayment in cents AND map the plan", async () => {
    jest.mocked(api.post).mockResolvedValueOnce(apiInstallmentPlan);

    const result = await prepayInstallmentPlan({
      date: "2026-10-16",
      discount: 12000,
      planId: "plan-1",
      targetInvoiceMonth: "2026-10",
    });

    expect(result.id).toBe("plan-1");
    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/installment-plans/plan-1/prepayment",
      {
        date: "2026-10-16",
        discount: 12000,
        targetInvoiceMonth: "2026-10",
        today: "2026-10-16",
      },
    );
  });

  it("SHOULD map 400, 409 and 422 of a prepayment", async () => {
    const params = {
      date: "2026-10-16",
      planId: "plan-1",
      targetInvoiceMonth: "2026-10",
    };

    jest.mocked(api.post).mockRejectedValueOnce(new ApiBusinessError("x", 400));
    expect(await capture(prepayInstallmentPlan(params))).toBeInstanceOf(
      FieldInvalid,
    );

    jest.mocked(api.post).mockRejectedValueOnce(new ApiBusinessError("x", 409));
    expect(await capture(prepayInstallmentPlan(params))).toBeInstanceOf(
      InstallmentPaid,
    );

    jest
      .mocked(api.get)
      .mockRejectedValueOnce(new ApiBusinessError("Invoice is paid", 422));
    expect(
      await capture(
        previewPrepayment({ planId: "plan-1", targetInvoiceMonth: "2026-10" }),
      ),
    ).toBeInstanceOf(InvoiceIsPaid);
  });

  it("SHOULD DELETE the prepayment AND map 422", async () => {
    await undoPrepayment("plan-1");

    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/installment-plans/plan-1/prepayment",
    );

    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("Invoice is paid", 422));
    expect(await capture(undoPrepayment("plan-1"))).toBeInstanceOf(
      InvoiceIsPaid,
    );
  });
});
