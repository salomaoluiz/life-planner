import { supabase } from "@infrastructure/supabase";

import datasource from "../familyMemberDatasourceImpl";

// region mocks

const responseError = {
  error: new Error("Something wrong"),
};
// endregion mocks

// region spies
const supabaseDeleteSpy = jest.fn();
const supabaseEqSpy = jest.fn();
const supabaseThenSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    delete: supabaseDeleteSpy.mockReturnThis(),
    eq: supabaseEqSpy.mockReturnThis(),
    then: supabaseThenSpy,
  } as never;
});
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
  supabaseDelete: supabaseDeleteSpy,
  supabaseEq: supabaseEqSpy,
  supabaseFrom: supabaseFromSpy,
  supabaseThen: supabaseThenSpy,
};

const mocks = {
  responseError,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
