import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import updateCategory, { Params } from "../updateCategory";

const defaultParams: Params = {
  depthLevel: 1,
  icon: "new-icon",
  id: "cat-uuid",
  name: "New Category",
  owner: "USER",
  ownerId: "user-uuid",
  parentId: "parent-uuid",
};

const responseMock = {
  data: null,
  error: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return updateCategory(defaultParams);
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  responseMock,
};

export { mocks, setup, spies };
