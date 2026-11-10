import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import createAccountUseCase from "./createAccountUseCase";

it("SHOULD create an account", async () => {
  const useCase = createAccountUseCase(repositoriesMocks);
  await useCase.execute({
    balance: 100,
    icon: "icon",
    name: "Acc",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  });

  expect(
    repositoriesMocks.financialRepository.account.createAccount,
  ).toHaveBeenCalled();
});

describe("error handling and arguments", () => {
  const params = {
    balance: 100,
    icon: "icon",
    name: "Acc",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  };
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.account.createAccount,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD call the repository with the mapped params", async () => {
    await createAccountUseCase(repositoriesMocks).execute(params);

    expect(repository()).toHaveBeenCalledWith({
      balance: 100,
      icon: "icon",
      name: "Acc",
      owner: OwnerType.USER,
      ownerId: "user-id",
      status: "ACTIVE",
    });
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      createAccountUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.createAccountUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      createAccountUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error).not.toHaveProperty("context");
  });
});

it("SHOULD throw FieldInvalid WHEN the owner is not valid", async () => {
  await expect(
    createAccountUseCase(repositoriesMocks).execute({
      balance: 1,
      icon: "icon",
      name: "Acc",
      owner: "INVALID",
      ownerId: "user-id",
      status: "ACTIVE",
    }),
  ).rejects.toBeInstanceOf(FieldInvalid);
  expect(
    repositoriesMocks.financialRepository.account.createAccount,
  ).not.toHaveBeenCalled();
});

describe("type (spec 101)", () => {
  const params = {
    balance: 1,
    icon: "icon",
    name: "Acc",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD forward a valid type", async () => {
    await createAccountUseCase(repositoriesMocks).execute({
      ...params,
      type: "BROKERAGE",
    });

    expect(
      repositoriesMocks.financialRepository.account.createAccount,
    ).toHaveBeenCalledWith(expect.objectContaining({ type: "BROKERAGE" }));
  });

  it("SHOULD throw FieldInvalid WHEN the type is not valid", async () => {
    await expect(
      createAccountUseCase(repositoriesMocks).execute({
        ...params,
        type: "FOO",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(
      repositoriesMocks.financialRepository.account.createAccount,
    ).not.toHaveBeenCalled();
  });
});

it("SHOULD forward the currency to the repository (spec 103)", async () => {
  jest.clearAllMocks();

  await createAccountUseCase(repositoriesMocks).execute({
    balance: 0,
    currency: "EUR",
    icon: "icon",
    name: "Acc",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  });

  expect(
    repositoriesMocks.financialRepository.account.createAccount,
  ).toHaveBeenCalledWith(expect.objectContaining({ currency: "EUR" }));
});
