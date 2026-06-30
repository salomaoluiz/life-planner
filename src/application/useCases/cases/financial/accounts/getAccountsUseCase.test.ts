import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
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
