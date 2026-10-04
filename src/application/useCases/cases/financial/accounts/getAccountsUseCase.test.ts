import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import AccountEntity, {
  AccountStatus,
} from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getAccountsUseCase from "./getAccountsUseCase";

it("SHOULD retrieve accounts", async () => {
  const mockAccounts = [
    new AccountEntity({
      balance: 50,
      icon: "icon",
      id: "id",
      name: "Savings",
      owner: OwnerType.USER,
      ownerId: "user-id",
      status: AccountStatus.ACTIVE,
    }),
  ];
  jest
    .mocked(repositoriesMocks.financialRepository.account.getAccounts)
    .mockResolvedValue(mockAccounts);

  const useCase = getAccountsUseCase(repositoriesMocks);
  const result = await useCase.execute(["user-id"]);

  expect(result).toHaveLength(1);
});

describe("error handling", () => {
  function repository() {
    return jest.mocked(
      repositoriesMocks.financialRepository.account.getAccounts,
    );
  }

  it("SHOULD pass the owner ids to the repository", async () => {
    repository().mockResolvedValueOnce([]);

    const result = await getAccountsUseCase(repositoriesMocks).execute([
      "user-id",
    ]);

    expect(repository()).toHaveBeenCalledWith(["user-id"]);
    expect(result).toEqual([]);
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    repository().mockRejectedValueOnce(error);

    await expect(
      getAccountsUseCase(repositoriesMocks).execute(["user-id"]),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.getAccountsUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    repository().mockRejectedValueOnce(error);

    await expect(
      getAccountsUseCase(repositoriesMocks).execute(["user-id"]),
    ).rejects.toBe(error);
  });
});
