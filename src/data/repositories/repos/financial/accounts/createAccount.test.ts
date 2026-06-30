import AccountEntity from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/createAccount.mocks";

it("SHOULD create an account", async () => {
  await setup();
  expect(spies.financialAccountDatasource.createAccount).toHaveBeenCalledWith({
    balance: mocks.defaultParams.balance,
    icon: mocks.defaultParams.icon,
    name: mocks.defaultParams.name,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    status: mocks.defaultParams.status,
  });
});

it("SHOULD return account created", async () => {
  const result = await setup();
  expect(result).toEqual(
    new AccountEntity({
      balance: mocks.accountModel.balance,
      icon: mocks.accountModel.icon,
      id: mocks.accountModel.id,
      name: mocks.accountModel.name,
      owner: OwnerType[mocks.accountModel.owner],
      ownerId: mocks.accountModel.ownerId,
      status: mocks.accountModel.status,
    }),
  );
});

it("SHOULD invalidate cache after account created", async () => {
  await setup();
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
});
