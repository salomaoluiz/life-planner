import { invoiceEntity } from "@application/dto/financial/mocks/CreditCard.mocks";
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import CardInvoiceEntity from "@domain/entities/financial/CardInvoiceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getCardInvoicesForMonthUseCase from "./getCardInvoicesForMonthUseCase";
import getCardInvoiceUseCase from "./getCardInvoiceUseCase";
import payInvoiceUseCase from "./payInvoiceUseCase";
import undoInvoicePaymentUseCase from "./undoInvoicePaymentUseCase";

const repository = jest.mocked(
  repositoriesMocks.financialRepository.creditCard,
);
const cardInvoice = new CardInvoiceEntity({
  card: {
    color: "#2B3A8C",
    id: "card-id",
    owner: OwnerType.USER,
    ownerId: "user-id",
    title: "Main card",
  },
  invoice: invoiceEntity,
  purchases: [],
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getCardInvoicesForMonthUseCase", () => {
  it("SHOULD return DTOs of the repository entities", async () => {
    repository.getCardInvoicesForMonth.mockResolvedValueOnce([cardInvoice]);

    const result = await getCardInvoicesForMonthUseCase(
      repositoriesMocks,
    ).execute({ month: "2026-11", ownerIds: ["user-id"] });

    expect(result[0].card.title).toBe("Main card");
    expect(result[0].invoice.referenceMonth).toBe("2026-10");
  });

  it("SHOULD add the context and rethrow BusinessErrors", async () => {
    const error = new BusinessError();
    repository.getCardInvoicesForMonth.mockRejectedValueOnce(error);

    await expect(
      getCardInvoicesForMonthUseCase(repositoriesMocks).execute({
        month: "2026-11",
        ownerIds: [],
      }),
    ).rejects.toBe(error);
  });
});

describe("getCardInvoiceUseCase", () => {
  it("SHOULD return the DTO", async () => {
    repository.getCardInvoice.mockResolvedValueOnce(cardInvoice);

    const result = await getCardInvoiceUseCase(repositoriesMocks).execute({
      creditCardId: "card-id",
      month: "2026-10",
    });

    expect(result.invoice.amount).toBe(0);
  });

  it("SHOULD rethrow errors", async () => {
    repository.getCardInvoice.mockRejectedValueOnce(new BusinessError());

    await expect(
      getCardInvoiceUseCase(repositoriesMocks).execute({
        creditCardId: "card-id",
        month: "2026-10",
      }),
    ).rejects.toBeInstanceOf(BusinessError);
  });
});

describe("payInvoiceUseCase", () => {
  const base = {
    creditCardId: "card-id",
    month: "2026-10",
    paidOn: "2026-11-05",
  };

  it("SHOULD pay with an account AND by boleto", async () => {
    await payInvoiceUseCase(repositoriesMocks).execute({
      ...base,
      accountId: "acc-1",
      method: "ACCOUNT",
    });
    await payInvoiceUseCase(repositoriesMocks).execute({
      ...base,
      method: "EXTERNAL",
    });

    expect(repository.payInvoice).toHaveBeenNthCalledWith(1, {
      ...base,
      accountId: "acc-1",
      method: "ACCOUNT",
    });
    expect(repository.payInvoice).toHaveBeenNthCalledWith(2, {
      ...base,
      accountId: undefined,
      method: "EXTERNAL",
    });
  });

  it.each([
    ["an unknown method", { method: "PIX" }],
    ["ACCOUNT without an account", { method: "ACCOUNT" }],
    ["EXTERNAL with an account", { accountId: "a", method: "EXTERNAL" }],
  ])("SHOULD throw FieldInvalid for %s", async (_label, patch) => {
    await expect(
      payInvoiceUseCase(repositoriesMocks).execute({ ...base, ...patch }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(repository.payInvoice).not.toHaveBeenCalled();
  });

  it("SHOULD rethrow repository errors", async () => {
    repository.payInvoice.mockRejectedValueOnce(new BusinessError());

    await expect(
      payInvoiceUseCase(repositoriesMocks).execute({
        ...base,
        method: "EXTERNAL",
      }),
    ).rejects.toBeInstanceOf(BusinessError);
  });
});

describe("undoInvoicePaymentUseCase", () => {
  it("SHOULD delegate AND rethrow errors", async () => {
    await undoInvoicePaymentUseCase(repositoriesMocks).execute({
      creditCardId: "card-id",
      month: "2026-10",
    });
    expect(repository.undoInvoicePayment).toHaveBeenCalledWith({
      creditCardId: "card-id",
      month: "2026-10",
    });

    repository.undoInvoicePayment.mockRejectedValueOnce(new BusinessError());
    await expect(
      undoInvoicePaymentUseCase(repositoriesMocks).execute({
        creditCardId: "card-id",
        month: "2026-10",
      }),
    ).rejects.toBeInstanceOf(BusinessError);
  });
});
