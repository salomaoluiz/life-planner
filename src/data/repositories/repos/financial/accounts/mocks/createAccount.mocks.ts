import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import AccountModel from "@data/models/financial/AccountModel";
import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import createAccount, { Params } from "../createAccount";

const defaultParams: Params = {
  balance: 100,
  icon: "icon",
  name: "Account",
  owner: OwnerType.USER,
  ownerId: "user-id",
  status: "ACTIVE",
};

const accountModelMock = new AccountModel({
  balance: 100,
  icon: "icon",
  id: "acc-uuid",
  name: "Account",
  owner: OwnerType.USER,
  ownerId: "user-id",
  status: AccountStatus.ACTIVE,
});

const datasourceSpy = jest.mocked(datasourcesMocks.financialAccountDatasource);
datasourceSpy.createAccount.mockResolvedValue(accountModelMock);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return createAccount(defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialAccountDatasource: datasourceSpy,
};

const mocks = {
  accountModel: accountModelMock,
  defaultParams,
};

export { mocks, setup, spies };
