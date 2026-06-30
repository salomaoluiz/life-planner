import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import getCategories, { Params } from "../getCategories";

const defaultParams: Params = ["user-uuid"];

const responseMock = {
  data: [
    {
      depth_level: 0,
      icon: "icon",
      id: "cat-uuid",
      name: "Category",
      owner: "USER",
      owner_id: "user-uuid",
      parent_id: null,
    },
  ],
  error: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getCategories(defaultParams);
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  responseMock,
};

export { mocks, setup, spies };
