import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";

import * as createUser from "../createUser";
import * as getUser from "../getUser";
import * as getUserById from "../getUserById";
import userRepositoryImpl from "../userRepositoryImpl";

// region mocks

// endregion mocks

// region spies

const createUserSpy = jest.spyOn(createUser, "default");
createUserSpy.mockResolvedValue("createUser response" as never);

const getUserSpy = jest.spyOn(getUser, "default");
getUserSpy.mockResolvedValue("getUser response" as never);

const getUserByIdSpy = jest.spyOn(getUserById, "default");
getUserByIdSpy.mockResolvedValue("getUserById response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return userRepositoryImpl(datasourcesMocks);
}

const spies = {
  createUser: createUserSpy,
  getUser: getUserSpy,
  getUserById: getUserByIdSpy,
};

const mocks = {
  datasources: datasourcesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
