import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import AccountModel from "@data/models/financial/AccountModel";
import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import getAccounts from "../getAccounts";

const defaultParams = ["user-id"];

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
datasourceSpy.getAccounts.mockResolvedValue([accountModelMock]);

const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getAccounts(defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    get: getCacheSpy,
    set: setCacheSpy,
  },
  financialAccountDatasource: datasourceSpy,
};

const mocks = {
  accountModel: accountModelMock,
  defaultParams,
};

export { mocks, setup, spies };
