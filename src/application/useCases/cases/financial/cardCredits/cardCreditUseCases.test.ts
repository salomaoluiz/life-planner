import {
  DefaultError,
  FieldInvalid,
  GenericError,
} from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import createEarlyPaymentUseCase from "./createEarlyPaymentUseCase";
import createRefundUseCase from "./createRefundUseCase";
import deleteEarlyPaymentUseCase from "./deleteEarlyPaymentUseCase";
import deleteRefundUseCase from "./deleteRefundUseCase";
import updateEarlyPaymentUseCase from "./updateEarlyPaymentUseCase";
import updateRefundUseCase from "./updateRefundUseCase";

const cardCredit = {
  createEarlyPayment: jest.fn(),
  createRefund: jest.fn(),
  deleteEarlyPayment: jest.fn(),
  deleteRefund: jest.fn(),
  updateEarlyPayment: jest.fn(),
  updateRefund: jest.fn(),
};
const repositories = {
  financialRepository: { cardCredit },
} as unknown as Repositories;

const refund = {
  creditCardId: "card-1",
  date: "2026-10-16",
  description: "Refund",
  invoiceMonth: "2026-10",
  value: 500,
};
const early = {
  accountId: "acc-1",
  creditCardId: "card-1",
  date: "2026-10-16",
  description: "Early payment",
  invoiceMonth: "2026-10",
  method: "ACCOUNT" as const,
  value: 600,
};

beforeEach(() => jest.clearAllMocks());

describe("refunds", () => {
  it("SHOULD create, update and delete through the repository", async () => {
    await createRefundUseCase(repositories).execute(refund);
    await updateRefundUseCase(repositories).execute({
      creditCardId: "card-1",
      id: "r1",
      refundedTransactionId: null,
      value: 5,
    });
    await deleteRefundUseCase(repositories).execute({
      creditCardId: "card-1",
      id: "r1",
    });

    expect(cardCredit.createRefund).toHaveBeenCalledWith(refund);
    expect(cardCredit.updateRefund).toHaveBeenCalledTimes(1);
    expect(cardCredit.deleteRefund).toHaveBeenCalledWith({
      creditCardId: "card-1",
      id: "r1",
    });
  });

  it.each([
    { value: 0 },
    { value: 1.5 },
    { description: "  " },
    { date: "16/10/2026" },
    { invoiceMonth: "2026-13" },
  ])("SHOULD refuse %p BEFORE the repository", async (patch) => {
    await expect(
      createRefundUseCase(repositories).execute({ ...refund, ...patch }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(cardCredit.createRefund).not.toHaveBeenCalled();
  });

  it("SHOULD add the use case name to a DefaultError AND rethrow other errors", async () => {
    const error = new GenericError();
    const addContext = jest.spyOn(error, "addContext");

    cardCredit.createRefund.mockRejectedValueOnce(error);
    await expect(
      createRefundUseCase(repositories).execute(refund),
    ).rejects.toBe(error);
    expect(addContext).toHaveBeenCalledWith({
      useCase: "financial.createRefundUseCase",
    });
    expect(error).toBeInstanceOf(DefaultError);

    const plain = new Error("boom");
    cardCredit.deleteRefund.mockRejectedValueOnce(plain);
    await expect(
      deleteRefundUseCase(repositories).execute({ creditCardId: "c", id: "r" }),
    ).rejects.toBe(plain);
  });
});

describe("early payments", () => {
  it("SHOULD create, update and delete through the repository", async () => {
    await createEarlyPaymentUseCase(repositories).execute(early);
    await updateEarlyPaymentUseCase(repositories).execute({
      creditCardId: "card-1",
      id: "e1",
      value: 5,
    });
    await deleteEarlyPaymentUseCase(repositories).execute({
      creditCardId: "card-1",
      id: "e1",
    });

    expect(cardCredit.createEarlyPayment).toHaveBeenCalledWith(early);
    expect(cardCredit.updateEarlyPayment).toHaveBeenCalledTimes(1);
    expect(cardCredit.deleteEarlyPayment).toHaveBeenCalledTimes(1);
  });

  it("SHOULD require an account for ACCOUNT and refuse one for EXTERNAL", async () => {
    await expect(
      createEarlyPaymentUseCase(repositories).execute({
        ...early,
        accountId: undefined,
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      createEarlyPaymentUseCase(repositories).execute({
        ...early,
        method: "EXTERNAL",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(cardCredit.createEarlyPayment).not.toHaveBeenCalled();
  });

  it("SHOULD accept a boleto without account AND refuse a value below 1 cent", async () => {
    await createEarlyPaymentUseCase(repositories).execute({
      ...early,
      accountId: undefined,
      method: "EXTERNAL",
    });
    await expect(
      createEarlyPaymentUseCase(repositories).execute({ ...early, value: 0 }),
    ).rejects.toBeInstanceOf(FieldInvalid);
  });
});
