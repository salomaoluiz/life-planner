import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import datasource from "../familyMemberDatasourceImpl";

// region mocks

const responseError = {
  error: new Error("Something wrong"),
};
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(id: string) {
  return datasource().deleteFamilyMember(id);
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
  responseError,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
