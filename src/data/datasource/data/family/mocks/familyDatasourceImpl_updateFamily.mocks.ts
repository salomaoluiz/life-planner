import { UpdateFamilyDatasourceParams } from "@data/repositories/repos/family/familyDatasource";
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

async function setup(props: UpdateFamilyDatasourceParams) {
  return familyDatasourceImpl().updateFamily(props);
}

async function throwableSetup(props: UpdateFamilyDatasourceParams) {
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
  responseError: responseErrorMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
