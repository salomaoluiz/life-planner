import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import createCategory, { Params } from "../createCategory";

const defaultParams: Params = {
  depthLevel: 0,
  icon: "icon",
  iconColor: "black",
  name: "Category",
  owner: "USER",
  ownerId: "user-uuid",
  parentId: undefined,
};

const responseMock = {
  data: [
    {
      depth_level: 0,
      icon: "icon",
      icon_color: "black",
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
  return createCategory(defaultParams);
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  responseMock,
};

export { mocks, setup, spies };
