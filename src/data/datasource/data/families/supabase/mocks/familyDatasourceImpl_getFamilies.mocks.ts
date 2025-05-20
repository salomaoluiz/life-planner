import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import familyDatasourceImpl from "../familyDatasourceImpl";

// region mocks

const responseErrorMock = {
  error: new Error("Error"),
};

const familyMembersSuccessResponseMock = {
  data: [
    {
      family_id: "123",
      user_id: "321",
    },
  ],
};

const ownerFamilyMock = {
  family_name: "Family Name",
  id: "123",
  owner_id: "321",
};

const otherFamilyMock = {
  family_name: "Family Name",
  id: "123",
  owner_id: "123",
};

const familiesSuccessResponseMock = {
  data: [ownerFamilyMock, otherFamilyMock],
};

const responseEmptyDataMock = {
  data: null,
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(userId: string) {
  return familyDatasourceImpl().getFamilies(userId);
}

async function throwableSetup(userId: string) {
  try {
    await setup(userId);
  } catch (error) {
    return error;
  }
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  familiesSuccessResponse: familiesSuccessResponseMock,
  familyMembersSuccessResponse: familyMembersSuccessResponseMock,
  responseEmptyData: responseEmptyDataMock,
  responseError: responseErrorMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
