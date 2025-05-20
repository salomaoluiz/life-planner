import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import updateCategory, { Params } from "../updateCategory";

// region mocks
const defaultParams: Params = {
  depthLevel: 0,
  icon: "icon",
  id: "f4690cee-afbe-44ec-a23f-40d62fe78408",
  name: "Category Name",
  owner: "USER",
  ownerId: "f4690cee-afbe-44ec-a23f-40d62fe78408",
  parentId: undefined,
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
  return updateCategory({ ...defaultParams, ...params });
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
