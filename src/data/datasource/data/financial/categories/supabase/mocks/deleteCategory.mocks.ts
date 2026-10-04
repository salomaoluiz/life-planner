import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import deleteCategory, { Params } from "../deleteCategory";

const defaultParams: Params = {
  id: "cat-uuid",
  ownerId: "user-uuid",
};

const responseMock = {
  data: null,
  error: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteCategory(defaultParams);
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  responseMock,
};

export { mocks, setup, spies };
