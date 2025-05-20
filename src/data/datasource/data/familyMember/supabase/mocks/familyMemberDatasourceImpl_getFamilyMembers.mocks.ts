import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import datasource from "../familyMemberDatasourceImpl";

// region mocks

const responseError = {
  error: new Error("Something wrong"),
};

const emptyResponse = {
  data: null,
};

const successResponse = {
  data: [
    {
      email: "teste@gmail.com",
      family_id: "321",
      id: "123",
      invite_token: "fake_jwt_token",
      join_date: "2021-09-09",
      user_id: "111",
    },
  ],
};
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(familyId: string) {
  return datasource().getFamilyMembers(familyId);
}

async function throwableSetup(familyId: string) {
  try {
    await setup(familyId);
  } catch (error) {
    return error;
  }
}
const spies = {
  ...supabase.spies,
};

const mocks = {
  emptyResponse,
  responseError,
  successResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
