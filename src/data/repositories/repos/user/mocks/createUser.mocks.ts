import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";

import createUser, { Params } from "../createUser";

// region mocks
const defaultParams: Params = {
  avatarURL: "https://example.com/avatar.jpg",
  email: "test@gmail.com",
  id: "34f046ca-b784-4e31-8444-e1ad1591a1d2",
  name: "Test User",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<Params>) {
  return createUser({ ...defaultParams, ...props }, datasourcesMocks);
}

const spies = {
  userDatasource: jest.mocked(datasourcesMocks.userDatasource),
};

const mocks = {
  defaultParams,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
