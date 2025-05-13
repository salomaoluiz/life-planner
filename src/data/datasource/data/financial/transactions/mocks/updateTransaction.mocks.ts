import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import updateTransaction, { Params } from "../updateTransaction";

// region mocks
const defaultParams: Params = {
  category: "FOOD",
  date: new Date().toISOString(),
  description: "Some description",
  id: "98d24efd-aff7-4055-afe4-bc2d5ae98927",
  owner: "FAMILY",
  ownerId: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
  type: "EXPENSE",
  value: "100",
};

const unknownError = {
  data: null,
  error: new Error("Some error"),
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return updateTransaction({ ...defaultParams, ...params });
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
    unknown: unknownError,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
