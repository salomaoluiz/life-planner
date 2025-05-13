import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import LoginWithGoogleModel from "@data/models/auth/LoginWithGoogleModel";
import { BusinessError } from "@domain/entities/errors";
import * as platform from "@utils/platform";

import loginWithGoogle from "../loginWithGoogle";

// region mocks

const loginWithIdTokenSuccess = new LoginWithGoogleModel({
  avatarURL: "https://avatar.com",
  email: "teste@gmail.com",
  id: "2b2dd719-19e1-46bc-8500-2b32f6f55041",
  name: "User Name",
});

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_context",
});

// endregion mocks

// region spies
const isWebSpy = jest.spyOn(platform, "isWeb");
isWebSpy.mockReturnValue(false);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginWithGoogle(datasourcesMocks);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  isWeb: isWebSpy,
  loginDatasource: jest.mocked(datasourcesMocks.loginDatasource),
};

const mocks = {
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  success: {
    loginWithIdToken: loginWithIdTokenSuccess,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
