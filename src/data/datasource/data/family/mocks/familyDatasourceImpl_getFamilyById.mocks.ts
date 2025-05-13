import { BusinessError } from "@domain/entities/errors";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import familyDatasourceImpl from "../familyDatasourceImpl";

// region mocks
const defaultParams = "62827970-84b1-465b-a972-741aa54eb55c";

const unknownErrorMock = {
  error: new Error("Error"),
};

const businessErrorMock = new BusinessError();
businessErrorMock.addContext({
  any_context: "any_context",
});

const familyMock = {
  family_name: "Family Name",
  id: "123",
  owner_id: "123",
};

const responseEmptyDataMock = {
  data: null,
};

const responseSuccessMock = {
  data: [familyMock],
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: string) {
  return familyDatasourceImpl().getFamilyById(params ?? defaultParams);
}

async function throwableSetup(params?: string) {
  try {
    await setup(params ?? defaultParams);
  } catch (error) {
    return error;
  }
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  supabase: {
    errors: {
      business: businessErrorMock,
      unknown: unknownErrorMock,
    },
    success: {
      empty: responseEmptyDataMock,
      family: responseSuccessMock,
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
