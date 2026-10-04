import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import cache from "@infrastructure/cache";

import signUpWithEmail from "../signUpWithEmail";

// region mocks

const params = {
  email: "test@example.com",
  name: "Test User",
  password: "password123",
};
const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_context" });

// endregion mocks

// region spies

const invalidateSpy = jest
  .spyOn(cache, "invalidate")
  .mockImplementation(jest.fn());

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return signUpWithEmail(params, datasourcesMocks);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  invalidate: invalidateSpy,
  loginDatasource: jest.mocked(datasourcesMocks.loginDatasource),
};

const mocks = {
  errors: { business: businessError, unknown: unknownError },
  params,
};

export { mocks, setup, setupThrowable, spies };
