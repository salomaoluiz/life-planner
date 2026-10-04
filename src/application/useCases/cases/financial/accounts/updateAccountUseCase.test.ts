import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import updateAccountUseCase from "./updateAccountUseCase";

it("SHOULD update an account", async () => {
  const useCase = updateAccountUseCase(repositoriesMocks);
  await useCase.execute({ id: "acc-id", name: "Updated" });
  expect(
    repositoriesMocks.financialRepository.account.updateAccount,
  ).toHaveBeenCalled();
});

describe("error handling and arguments", () => {
  const params = {
    balance: 5,
    icon: "icon",
    id: "acc-id",
    name: "Updated",
    ownerId: "user-id",
    status: "ACTIVE",
  };
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.account.updateAccount,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD call the repository with the mapped params", async () => {
    await updateAccountUseCase(repositoriesMocks).execute(params);

    expect(repository()).toHaveBeenCalledWith({
      balance: 5,
      icon: "icon",
      id: "acc-id",
      name: "Updated",
      ownerId: "user-id",
      status: "ACTIVE",
    });
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      updateAccountUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.updateAccountUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      updateAccountUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error).not.toHaveProperty("context");
  });
});
