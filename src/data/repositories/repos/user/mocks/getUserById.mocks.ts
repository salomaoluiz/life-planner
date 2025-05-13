import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import UserModel from "@data/models/user/UserModel";
import cache from "@infrastructure/cache";

import getUserById, { Params } from "../getUserById";

// region mocks
const defaultParams: Params = "277ce153-4e01-431b-a6ed-9cc0f6c3e3d5";

const userModelMock = new UserModel({
  avatarURL: "https://example.com/avatar.jpg",
  email: "test@gmail.com",
  id: defaultParams,
  name: "John Doe",
});

// endregion mocks

// region spies

const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return getUserById(params ?? defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    get: getCacheSpy,
    set: setCacheSpy,
  },
  userDatasource: jest.mocked(datasourcesMocks.userDatasource),
};

const mocks = {
  defaultParams,
  userModel: userModelMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
