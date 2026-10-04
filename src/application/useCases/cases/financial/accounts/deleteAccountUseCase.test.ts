import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import deleteAccountUseCase from "./deleteAccountUseCase";

it("SHOULD delete an account", async () => {
  const useCase = deleteAccountUseCase(repositoriesMocks);
  await useCase.execute({ id: "acc-id", ownerId: "user-id" });
  expect(
    repositoriesMocks.financialRepository.account.deleteAccount,
  ).toHaveBeenCalled();
});

describe("error handling and arguments", () => {
  const params = { id: "acc-id", ownerId: "user-id" };
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.account.deleteAccount,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD call the repository with the mapped params", async () => {
    await deleteAccountUseCase(repositoriesMocks).execute(params);

    expect(repository()).toHaveBeenCalledWith({
      id: "acc-id",
      ownerId: "user-id",
    });
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      deleteAccountUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.deleteAccountUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      deleteAccountUseCase(repositoriesMocks).execute(params),
    ).rejects.toBe(error);
    expect(error).not.toHaveProperty("context");
  });
});
