import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";

import loginRepositoryImpl from "../loginRepositoryImpl";
import * as loginWithGoogle from "../loginWithGoogle";
import * as logout from "../logout";
import * as saveSession from "../saveSession";

// region mocks

// endregion mocks

// region spies

const loginWithGoogleSpy = jest
  .spyOn(loginWithGoogle, "default")
  .mockResolvedValue("loginWithGoogle response" as never);
const logoutSpy = jest
  .spyOn(logout, "default")
  .mockResolvedValue("logout response" as never);
const saveSessionSpy = jest
  .spyOn(saveSession, "default")
  .mockResolvedValue("saveSession response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return loginRepositoryImpl(datasourcesMocks);
}

const spies = {
  loginWithGoogle: loginWithGoogleSpy,
  logout: logoutSpy,
  saveSession: saveSessionSpy,
};

const mocks = {
  datasourcesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
