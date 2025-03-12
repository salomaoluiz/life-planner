import { datasourcesMocks } from "@data/datasource/mocks";
import UserModel from "@data/models/user";
import userRepositoryImpl from "@data/repositories/repos/user/userRepositoryImpl";

// region mocks

const getUserSuccess = {
  email: "email@email.com",
  id: "2b2dd719-19e1-46bc-8500-2b32f6f55041",
  name: "User Name",
  photoURL: "https://avatar.com",
} as UserModel;

// endregion mocks
const getUserSpy = datasourcesMocks.userDatasource.getUser;

async function setup() {
  return userRepositoryImpl(datasourcesMocks).getUser();
}

const spies = {
  getUser: getUserSpy,
};

const mocks = {
  getUserSuccess,
};

export { mocks, setup, spies };
