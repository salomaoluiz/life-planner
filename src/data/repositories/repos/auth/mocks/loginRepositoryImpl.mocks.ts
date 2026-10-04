import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";

import loginRepositoryImpl from "../loginRepositoryImpl";
import * as loginWithEmail from "../loginWithEmail";
import * as logout from "../logout";
import * as signUpWithEmail from "../signUpWithEmail";

// region spies

const loginWithEmailSpy = jest
  .spyOn(loginWithEmail, "default")
  .mockResolvedValue("loginWithEmail response" as never);
const logoutSpy = jest
  .spyOn(logout, "default")
  .mockResolvedValue("logout response" as never);
const signUpWithEmailSpy = jest
  .spyOn(signUpWithEmail, "default")
  .mockResolvedValue("signUpWithEmail response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return loginRepositoryImpl(datasourcesMocks);
}

const spies = {
  loginWithEmail: loginWithEmailSpy,
  logout: logoutSpy,
  signUpWithEmail: signUpWithEmailSpy,
};

const mocks = {
  datasourcesMocks,
};

export { mocks, setup, spies };
