import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import UserModel from "@data/models/user/UserModel";
import cache from "@infrastructure/cache";

import getUser from "../getUser";

// region mocks
const userModelMock = new UserModel({
  avatarURL: "https://example.com/avatar.jpg",
  email: "test@gmail.com",
  id: "05ff9a60-a7a4-44f7-a1d6-d82ce68fc9b6",
  name: "Test User",
});
// endregion mocks

// region spies
const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getUser(datasourcesMocks);
}

const spies = {
  cache: {
    get: getCacheSpy,
    set: setCacheSpy,
  },
  userDatasource: jest.mocked(datasourcesMocks.userDatasource),
};

const mocks = {
  userModel: userModelMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
