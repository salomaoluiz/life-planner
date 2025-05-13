import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import createUser, { Params } from "../createUser";

// region mocks
const defaultParams: Params = {
  avatarURL: "https://example.com/avatar.png",
  email: "teste@gmail.com",
  id: "b5320ffe-3264-479a-bd43-6fc06865e3d9",
  name: "User Name",
};

const responseSuccess = {
  data: null,
  error: null,
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
  return createUser({ ...defaultParams, ...params });
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
    response: responseSuccess,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
