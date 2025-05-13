import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import getUserById, { Params } from "../getUserById";

// region mocks
const defaultParams: Params = "c978d8bd-f8f1-4709-b02b-26057f436360";

const unknownError = {
  data: null,
  error: new Error("Some error"),
};

const successResponse = {
  data: [
    {
      avatar_url: "https://example.com/avatar.png",
      email: "teste@gmail.com",
      id: "c978d8bd-f8f1-4709-b02b-26057f436360",
      name: "Test User",
    },
  ],
  error: null,
};

const userNotFoundResponse = {
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
  return getUserById(params ?? defaultParams);
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
    empty: userNotFoundResponse,
    response: successResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
