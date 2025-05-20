import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import deleteCategory, { Params } from "../deleteCategory";

// region mocks
const defaultParams: Params = {
  id: "c978d8bd-f8f1-4709-b02b-26057f436360",
  ownerId: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
};

const unknownError = {
  data: null,
  error: new Error("Some error"),
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return deleteCategory({ ...defaultParams, ...params });
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
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
