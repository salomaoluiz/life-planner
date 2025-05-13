import { BusinessError } from "@domain/entities/errors";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import getTransactions, { Params } from "../getTransactions";

// region mocks
const defaultParams: Params = ["c978d8bd-f8f1-4709-b02b-26057f436360"];

const unknownError = {
  data: null,
  error: new Error("Some error"),
};

const businessError = new BusinessError();
businessError.addContext({
  any_context: "any context",
});

const withoutDataError = {
  data: null,
  error: null,
};

const successResponse = {
  data: [
    {
      category: "Food",
      date: new Date("2023-10-01").toISOString(),
      description: "Some description",
      id: "c978d8bd-f8f1-4709-b02b-26057f436360",
      owner: "FAMILY",
      owner_id: "c978d8bd-f8f1-4709-b02b-26057f436360",
      type: "EXPENSE",
      value: "100.00",
    },
  ],
  error: null,
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return getTransactions(params ?? defaultParams);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
    withoutData: withoutDataError,
  },
  success: {
    response: successResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
