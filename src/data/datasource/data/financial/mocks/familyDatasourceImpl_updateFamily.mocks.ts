import { UpdateFamilyDatasourceParams } from "@data/repositories/repos/family/familyDatasource";
import { supabase } from "@infrastructure/supabase";

import transactionDatasourceImpl from "../transactionDatasourceImpl";

// region mocks

const responseErrorMock = {
  error: new Error("Something wrong"),
};

// endregion mocks

// region spies

const supabaseUpdateSpy = jest.fn();
const supabaseEqSpy = jest.fn();
const supabaseThenSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    eq: supabaseEqSpy.mockReturnThis(),
    then: supabaseThenSpy,
    update: supabaseUpdateSpy.mockReturnThis(),
  } as never;
});

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props: UpdateFamilyDatasourceParams) {
  return transactionDatasourceImpl().updateFamily(props);
}

async function throwableSetup(props: UpdateFamilyDatasourceParams) {
  try {
    await setup(props);
  } catch (error) {
    return error;
  }
}

const spies = {
  supabaseEq: supabaseEqSpy,
  supabaseFrom: supabaseFromSpy,
  supabaseThen: supabaseThenSpy,
  supabaseUpdate: supabaseUpdateSpy,
};

const mocks = {
  responseError: responseErrorMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
