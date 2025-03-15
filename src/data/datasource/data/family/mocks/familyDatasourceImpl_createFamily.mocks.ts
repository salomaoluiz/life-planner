import { CreateFamilyDatasourceParams } from "@data/repositories/repos/family/familyDatasource";
import { supabase } from "@infrastructure/supabase";

import familyDatasourceImpl from "../familyDatasourceImpl";

// region mocks

const responseErrorMock = {
  error: new Error("Something wrong"),
};

const responseEmptyDataMock = {
  data: null,
};

const responseSuccessMock = {
  data: [{ id: "1", name: "Test Name", owner_id: "12" }],
};

// endregion mocks

// region spies

const supabaseUpsertSpy = jest.fn();
const supabaseSelectSpy = jest.fn();
const supabaseThenSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    select: supabaseSelectSpy.mockReturnThis(),
    then: supabaseThenSpy.mockReturnValue(responseSuccessMock),
    upsert: supabaseUpsertSpy.mockReturnThis(),
  } as never;
});

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props: CreateFamilyDatasourceParams) {
  return familyDatasourceImpl().createFamily(props);
}

async function throwableSetup(props: CreateFamilyDatasourceParams) {
  try {
    await setup(props);
  } catch (error) {
    return error;
  }
}

const spies = {
  supabaseFrom: supabaseFromSpy,
  supabaseSelect: supabaseSelectSpy,
  supabaseThen: supabaseThenSpy,
  supabaseUpsert: supabaseUpsertSpy,
};

const mocks = {
  responseEmptyData: responseEmptyDataMock,
  responseError: responseErrorMock,
  responseSuccess: responseSuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
