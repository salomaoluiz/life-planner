import { datasourcesMocks } from "@data/datasource/mocks";
import UserModel from "@data/models/user";
import userRepositoryImpl from "@data/repositories/repos/user/userRepositoryImpl";
import cache from "@infrastructure/cache";

// region mocks

const getUserSuccess = {
  email: "email@email.com",
  id: "2b2dd719-19e1-46bc-8500-2b32f6f55041",
  name: "User Name",
  photoURL: "https://avatar.com",
} as UserModel;

// endregion mocks

// region spies
const getUserSpy = datasourcesMocks.userDatasource.getUser;
const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");

// endregion spies

async function setup() {
  return userRepositoryImpl(datasourcesMocks).getUser();
}

const spies = {
  getCache: getCacheSpy,
  getUser: getUserSpy,
  setCache: setCacheSpy,
};

const mocks = {
  getUserSuccess,
};

export { mocks, setup, spies };
