import { BusinessError } from "@domain/entities/errors";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import invalidate, { Params } from "../invalidate";

// region mocks
const defaultParams: Params = {
  keys: [CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA],
  options: {
    uniqueId: "1000e3d4-857c-4f4d-8a6c-ca5d4ab2e499",
  },
};

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_context",
});

// endregion mocks

// region spies

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return invalidate(defaultParams);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  invalidateCache: invalidateCacheSpy,
};

const mocks = {
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
