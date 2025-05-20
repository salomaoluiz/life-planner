import { BusinessError } from "@domain/entities/errors";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import createCategory, { Params } from "../createCategory";

// region mocks
const defaultParams: Params = {
  depthLevel: 1,
  icon: "icon",
  name: "Food",
  owner: "FAMILY",
  ownerId: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
  parentId: "e6f9d8dd-19eb-44a1-ae14-16635a75eac0",
};

const responseSuccess = {
  data: [
    {
      depth_level: 1,
      icon: "icon",
      id: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
      name: "Food",
      owner: "FAMILY",
      owner_id: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
      parent_id: "e6f9d8dd-19eb-44a1-ae14-16635a75eac0",
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
  return createCategory({ ...defaultParams, ...params });
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
