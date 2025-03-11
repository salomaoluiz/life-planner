import loginRepositoryImpl from "@data/repositories/repos/auth/loginRepositoryImpl";
import { datasourcesMocks } from "@data/datasource/mocks";

const saveSessionSpy = datasourcesMocks.loginDatasource.saveSession;

function setup() {
  return loginRepositoryImpl(datasourcesMocks).saveSession({
    accessToken: "accessToken",
    refreshToken: "refreshToken",
  });
}

const spies = {
  saveSession: saveSessionSpy,
};

const mocks = {};

export { setup, spies, mocks };
