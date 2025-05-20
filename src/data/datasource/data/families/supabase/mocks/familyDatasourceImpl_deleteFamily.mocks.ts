import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import familyDatasourceImpl from "../familyDatasourceImpl";

// region mocks

const responseErrorMock = {
  error: new Error("Something wrong"),
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(id: string) {
  return familyDatasourceImpl().deleteFamily(id);
}

async function throwableSetup(id: string) {
  try {
    await setup(id);
  } catch (error) {
    return error;
  }
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  responseError: responseErrorMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
