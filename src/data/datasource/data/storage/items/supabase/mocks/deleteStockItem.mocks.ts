import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import deleteStockItem, { Params } from "../deleteStockItem";

// region mocks
const defaultParams: Params = "c978d8bd-f8f1-4709-b02b-26057f436360";

const unknownError = {
  data: null,
  error: new Error("Some error"),
};

const successResponse = {
  data: [],
  error: null,
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return deleteStockItem(params ?? defaultParams);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  errors: {
    unknown: unknownError,
  },
  success: {
    response: successResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
