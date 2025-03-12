import { datasourcesMocks } from "@data/datasource/mocks";
import loginRepositoryImpl from "@data/repositories/repos/auth/loginRepositoryImpl";
import * as platform from "@utils/platform";

const loginWithOAuthSpy = datasourcesMocks.loginDatasource.loginWithOAuth;
const loginWithIdTokenSpy = datasourcesMocks.loginDatasource.loginWithIdToken;
const isWebSpy = jest.spyOn(platform, "isWeb");

async function setup() {
  return loginRepositoryImpl(datasourcesMocks).loginWithGoogle();
}

const spies = {
  isWeb: isWebSpy,
  loginWithIdToken: loginWithIdTokenSpy,
  loginWithOAuth: loginWithOAuthSpy,
};

const mocks = {};

export { mocks, setup, spies };
