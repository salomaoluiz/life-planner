import loginRepositoryImpl from "@data/repositories/repos/auth/loginRepositoryImpl";
import { datasourcesMocks } from "@data/datasource/mocks";
import * as platform from "@utils/platform";

const loginWithOAuthSpy = datasourcesMocks.loginDatasource.loginWithOAuth;
const loginWithIdTokenSpy = datasourcesMocks.loginDatasource.loginWithIdToken;
const isWebSpy = jest.spyOn(platform, "isWeb");

function setup() {
  return loginRepositoryImpl(datasourcesMocks).loginWithGoogle();
}

const spies = {
  loginWithOAuth: loginWithOAuthSpy,
  loginWithIdToken: loginWithIdTokenSpy,
  isWeb: isWebSpy,
};

const mocks = {};

export { setup, spies, mocks };
