import { supabase } from "@infrastructure/supabase";

import transactionDatasourceImpl from "../transactionDatasourceImpl";

// region mocks

const responseErrorMock = {
  error: new Error("Something wrong"),
};

// endregion mocks

// region spies

const supabaseEqSpy = jest.fn();
const supabaseDeleteSpy = jest.fn();
const supabaseThenSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    delete: supabaseDeleteSpy.mockReturnThis(),
    eq: supabaseEqSpy.mockReturnThis(),
    then: supabaseThenSpy.mockReturnValue(null),
  } as never;
});

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(id: string) {
  return transactionDatasourceImpl().deleteFamily(id);
}

async function throwableSetup(id: string) {
  try {
    await setup(id);
  } catch (error) {
    return error;
  }
}

const spies = {
  supabaseDelete: supabaseDeleteSpy,
  supabaseEq: supabaseEqSpy,
  supabaseFrom: supabaseFromSpy,
  supabaseThen: supabaseThenSpy,
};

const mocks = {
  responseError: responseErrorMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
