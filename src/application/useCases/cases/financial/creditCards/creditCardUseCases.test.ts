import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import {
  cardEntity,
  overviewEntity,
} from "@application/dto/financial/mocks/CreditCard.mocks";
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import { CreditCardBrand } from "@domain/entities/financial/CreditCardEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import createCreditCardUseCase from "./createCreditCardUseCase";
import deleteCreditCardUseCase from "./deleteCreditCardUseCase";
import getCreditCardsOverviewUseCase from "./getCreditCardsOverviewUseCase";
import getCreditCardsUseCase from "./getCreditCardsUseCase";
import updateCreditCardUseCase from "./updateCreditCardUseCase";

const repository = jest.mocked(
  repositoriesMocks.financialRepository.creditCard,
);

const createParams = {
  brand: "VISA",
  closingDay: 31,
  color: "#6366F1",
  dueDay: 10,
  limit: 500000,
  owner: "USER",
  ownerId: "user-id",
  paymentDay: 5,
  title: "Main card",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createCreditCardUseCase", () => {
  it("SHOULD call the repository with the mapped owner and brand", async () => {
    await createCreditCardUseCase(repositoriesMocks).execute(createParams);

    expect(repository.createCreditCard).toHaveBeenCalledWith({
      brand: CreditCardBrand.VISA,
      closingDay: 31,
      color: "#6366F1",
      dueDay: 10,
      lastDigits: undefined,
      limit: 500000,
      owner: OwnerType.USER,
      ownerId: "user-id",
      paymentDay: 5,
      title: "Main card",
    });
  });

  it("SHOULD add the use case context and rethrow the same BusinessError", async () => {
    const error = new BusinessError();
    repository.createCreditCard.mockRejectedValueOnce(error);

    await expect(
      createCreditCardUseCase(repositoriesMocks).execute(createParams),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.createCreditCardUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository.createCreditCard.mockRejectedValueOnce(error);

    await expect(
      createCreditCardUseCase(repositoriesMocks).execute(createParams),
    ).rejects.toBe(error);
  });

  it("SHOULD throw FieldInvalid WITHOUT calling the repository for an unknown owner or brand", async () => {
    await expect(
      createCreditCardUseCase(repositoriesMocks).execute({
        ...createParams,
        owner: "INVALID",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      createCreditCardUseCase(repositoriesMocks).execute({
        ...createParams,
        brand: "DINERS",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(repository.createCreditCard).not.toHaveBeenCalled();
  });
});

describe("updateCreditCardUseCase", () => {
  it("SHOULD forward only given fields keeping null AND map owner and brand", async () => {
    await updateCreditCardUseCase(repositoriesMocks).execute({
      brand: "ELO",
      id: "c1",
      lastDigits: null,
      owner: "FAMILY",
      ownerId: "fam",
      paymentDay: null,
    });

    expect(repository.updateCreditCard).toHaveBeenCalledWith({
      brand: CreditCardBrand.ELO,
      closingDay: undefined,
      color: undefined,
      dueDay: undefined,
      id: "c1",
      lastDigits: null,
      limit: undefined,
      owner: OwnerType.FAMILY,
      ownerId: "fam",
      paymentDay: null,
      status: undefined,
      title: undefined,
    });
  });

  it("SHOULD throw FieldInvalid WHEN a given owner or brand is unknown", async () => {
    await expect(
      updateCreditCardUseCase(repositoriesMocks).execute({
        id: "c1",
        owner: "X",
        ownerId: "o",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      updateCreditCardUseCase(repositoriesMocks).execute({
        brand: "X",
        id: "c1",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(repository.updateCreditCard).not.toHaveBeenCalled();
  });

  it("SHOULD add context to business errors and rethrow unknown ones untouched", async () => {
    const business = new BusinessError();
    repository.updateCreditCard.mockRejectedValueOnce(business);
    await expect(
      updateCreditCardUseCase(repositoriesMocks).execute({ id: "c1" }),
    ).rejects.toBe(business);
    expect(business.context).toMatchObject({
      useCase: "financial.updateCreditCardUseCase",
    });

    const unknown = new Error("boom");
    repository.updateCreditCard.mockRejectedValueOnce(unknown);
    await expect(
      updateCreditCardUseCase(repositoriesMocks).execute({ id: "c1" }),
    ).rejects.toBe(unknown);
  });
});

describe("deleteCreditCardUseCase", () => {
  it("SHOULD forward the id", async () => {
    await deleteCreditCardUseCase(repositoriesMocks).execute({ id: "c1" });

    expect(repository.deleteCreditCard).toHaveBeenCalledWith({ id: "c1" });
  });

  it("SHOULD add context to business errors and rethrow unknown ones untouched", async () => {
    const business = new BusinessError();
    repository.deleteCreditCard.mockRejectedValueOnce(business);
    await expect(
      deleteCreditCardUseCase(repositoriesMocks).execute({ id: "c1" }),
    ).rejects.toBe(business);
    expect(business.context).toMatchObject({
      useCase: "financial.deleteCreditCardUseCase",
    });

    const unknown = new Error("boom");
    repository.deleteCreditCard.mockRejectedValueOnce(unknown);
    await expect(
      deleteCreditCardUseCase(repositoriesMocks).execute({ id: "c1" }),
    ).rejects.toBe(unknown);
  });
});

describe("getCreditCardsUseCase", () => {
  it("SHOULD return DTOs", async () => {
    repository.getCreditCards.mockResolvedValueOnce([cardEntity]);

    const result = await getCreditCardsUseCase(repositoriesMocks).execute([
      "user-id",
    ]);

    expect(repository.getCreditCards).toHaveBeenCalledWith(["user-id"]);
    expect(result[0]).toBeInstanceOf(CreditCardDTO);
  });

  it("SHOULD add context to business errors and rethrow unknown ones untouched", async () => {
    const business = new BusinessError();
    repository.getCreditCards.mockRejectedValueOnce(business);
    await expect(
      getCreditCardsUseCase(repositoriesMocks).execute([]),
    ).rejects.toBe(business);
    expect(business.context).toMatchObject({
      useCase: "financial.getCreditCardsUseCase",
    });

    const unknown = new Error("boom");
    repository.getCreditCards.mockRejectedValueOnce(unknown);
    await expect(
      getCreditCardsUseCase(repositoriesMocks).execute([]),
    ).rejects.toBe(unknown);
  });
});

describe("getCreditCardsOverviewUseCase", () => {
  it("SHOULD return the overview DTO", async () => {
    repository.getCreditCardsOverview.mockResolvedValueOnce(overviewEntity);

    const result = await getCreditCardsOverviewUseCase(
      repositoriesMocks,
    ).execute(["user-id"]);

    expect(result).toBeInstanceOf(CreditCardOverviewDTO);
    expect(result.cards[0].card.title).toBe("Main card");
  });

  it("SHOULD add context to business errors and rethrow unknown ones untouched", async () => {
    const business = new BusinessError();
    repository.getCreditCardsOverview.mockRejectedValueOnce(business);
    await expect(
      getCreditCardsOverviewUseCase(repositoriesMocks).execute([]),
    ).rejects.toBe(business);
    expect(business.context).toMatchObject({
      useCase: "financial.getCreditCardsOverviewUseCase",
    });

    const unknown = new Error("boom");
    repository.getCreditCardsOverview.mockRejectedValueOnce(unknown);
    await expect(
      getCreditCardsOverviewUseCase(repositoriesMocks).execute([]),
    ).rejects.toBe(unknown);
  });
});
