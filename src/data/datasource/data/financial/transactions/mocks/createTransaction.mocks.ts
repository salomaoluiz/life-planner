import { BusinessError } from "@domain/entities/errors";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import createTransaction, { Params } from "../createTransaction";

// region mocks
const defaultParams: Params = {
  category: "FOOD",
  date: new Date().toISOString(),
  description: "Some description",
  owner: "FAMILY",
  ownerId: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
  type: "EXPENSE",
  value: "100",
};

const responseSuccess = {
  data: [
    {
      category: "FOOD",
      date: new Date(),
      description: "Some description",
      id: "98d24efd-aff7-4055-afe4-bc2d5ae98927",
      owner: "FAMILY",
      owner_id: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
      type: "EXPENSE",
      value: 100,
    },
  ],
  error: null,
};

const unknownError = {
  data: null,
  error: new Error("Some error"),
};

const withoutDataError = {
  data: null,
  error: null,
};

const businessError = new BusinessError();
businessError.addContext({
  any_context: "any context",
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return createTransaction({ ...defaultParams, ...params });
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
    response: responseSuccess,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
