import { datasourcesMocks } from "@data/datasource/mocks";
import loginRepositoryImpl from "@data/repositories/repos/auth/loginRepositoryImpl";

const logoutSpy = datasourcesMocks.loginDatasource.logout;

async function setup() {
  return loginRepositoryImpl(datasourcesMocks).logout();
}

const spies = {
  logout: logoutSpy,
};

const mocks = {};

export { mocks, setup, spies };
