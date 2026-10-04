import AccountEntity from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setup, spies } from "./mocks/getAccounts.mocks";

it("SHOULD get accounts", async () => {
  const result = await setup();
  expect(result).toEqual([
    new AccountEntity({
      balance: mocks.accountModel.balance,
      icon: mocks.accountModel.icon,
      id: mocks.accountModel.id,
      name: mocks.accountModel.name,
      owner: OwnerType[mocks.accountModel.owner],
      ownerId: mocks.accountModel.ownerId,
      status: mocks.accountModel.status,
    }),
  ]);
});

it("SHOULD fetch from the datasource and cache the result WHEN there is no cache", async () => {
  spies.cache.get.mockReturnValueOnce(null);

  await setup();

  expect(spies.financialAccountDatasource.getAccounts).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
  expect(spies.cache.set).toHaveBeenCalledWith(expect.any(String), [
    mocks.accountModel.toJSON(),
  ]);
});

it("SHOULD return the cached accounts without calling the datasource WHEN cached", async () => {
  spies.cache.get.mockReturnValueOnce([mocks.accountModel.toJSON()]);

  const result = await setup();

  expect(spies.financialAccountDatasource.getAccounts).not.toHaveBeenCalled();
  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(result).toEqual([
    new AccountEntity({
      balance: mocks.accountModel.balance,
      icon: mocks.accountModel.icon,
      id: mocks.accountModel.id,
      name: mocks.accountModel.name,
      owner: OwnerType[mocks.accountModel.owner],
      ownerId: mocks.accountModel.ownerId,
      status: mocks.accountModel.status,
    }),
  ]);
});
