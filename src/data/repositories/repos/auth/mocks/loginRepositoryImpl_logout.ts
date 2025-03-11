import loginRepositoryImpl from "@data/repositories/repos/auth/loginRepositoryImpl";
import { datasourcesMocks } from "@data/datasource/mocks";

const logoutSpy = datasourcesMocks.loginDatasource.logout;

function setup() {
  return loginRepositoryImpl(datasourcesMocks).logout();
}

const spies = {
  logout: logoutSpy,
};

const mocks = {};

export { setup, spies, mocks };
