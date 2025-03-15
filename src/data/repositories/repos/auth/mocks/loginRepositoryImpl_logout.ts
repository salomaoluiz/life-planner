import { datasourcesMocks } from "@data/datasource/mocks";
import loginRepositoryImpl from "@data/repositories/repos/auth/loginRepositoryImpl";
import cache from "@infrastructure/cache";

// region spies
const logoutSpy = datasourcesMocks.loginDatasource.logout;
const invalidateAllSpy = jest.spyOn(cache, "invalidateAll");
// endregion spies

async function setup() {
  return loginRepositoryImpl(datasourcesMocks).logout();
}

const spies = {
  invalidateAll: invalidateAllSpy,
  logout: logoutSpy,
};

const mocks = {};

export { mocks, setup, spies };
