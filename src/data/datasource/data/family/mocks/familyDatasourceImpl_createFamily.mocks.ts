import { CreateFamilyDatasourceParams } from "@data/repositories/repos/family/familyDatasource";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

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
  ...supabase.spies,
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
