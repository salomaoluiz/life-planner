import { BusinessError } from "@domain/entities/errors";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import getCategories, { Params } from "../getCategories";

// region mocks
const defaultParams: Params = ["b30f59a8-6588-4a07-ba0d-f3952dfa29e6"];

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
      depth_level: 0,
      icon: "icon1",
      id: "508b1ad2-658d-4829-ad48-d66cac051e03",
      name: "Category 1",
      owner_id: "b30f59a8-6588-4a07-ba0d-f3952dfa29e6",
      parent_id: null,
    },
    {
      depth_level: 1,
      icon: "icon2",
      id: "508b1ad2-658d-4829-ad48-d66cac051e04",
      name: "Category Children 1",
      owner_id: "b30f59a8-6588-4a07-ba0d-f3952dfa29e6",
      parent_id: "508b1ad2-658d-4829-ad48-d66cac051e03",
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
  return getCategories(params ?? defaultParams);
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
