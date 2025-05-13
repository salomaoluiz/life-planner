import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import cache from "@infrastructure/cache";

import logout from "../logout";

// region mocks

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_context",
});

// endregion mocks

// region spies
const invalidateAllSpy = jest.spyOn(cache, "invalidateAll");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return logout(datasourcesMocks);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  invalidateAll: invalidateAllSpy,
  loginDatasource: jest.mocked(datasourcesMocks.loginDatasource),
};

const mocks = {
  errors: {
    business: businessError,
    unknown: unknownError,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
