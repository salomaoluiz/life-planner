import AccountEntity from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setup } from "./mocks/getAccounts.mocks";

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
