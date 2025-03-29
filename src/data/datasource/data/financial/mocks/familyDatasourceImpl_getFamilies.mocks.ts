import { supabase } from "@infrastructure/supabase";

import transactionDatasourceImpl from "../transactionDatasourceImpl";

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

const supabaseEqSpy = jest.fn();
const supabaseInSpy = jest.fn();
const supabaseSelectSpy = jest.fn();
const supabaseThenSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    eq: supabaseEqSpy.mockReturnThis(),
    in: supabaseInSpy.mockReturnThis(),
    select: supabaseSelectSpy.mockReturnThis(),
    then: supabaseThenSpy,
  } as never;
});

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(userId: string) {
  return transactionDatasourceImpl().getFamilies(userId);
}

async function throwableSetup(userId: string) {
  try {
    await setup(userId);
  } catch (error) {
    return error;
  }
}

const spies = {
  supabaseEq: supabaseEqSpy,
  supabaseFrom: supabaseFromSpy,
  supabaseIn: supabaseInSpy,
  supabaseSelect: supabaseSelectSpy,
  supabaseThen: supabaseThenSpy,
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
