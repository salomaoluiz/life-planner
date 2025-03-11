import { datasourcesMocks } from "@data/datasource/mocks";
import userRepositoryImpl from "@data/repositories/repos/user/userRepositoryImpl";

// region mocks

const getUserSuccess = {
  id: "2b2dd719-19e1-46bc-8500-2b32f6f55041",
  name: "User Name",
  email: "email@email.com",
  avatar: "https://avatar.com",
};

// endregion mocks
const getUserSpy = datasourcesMocks.userDatasource.getUser;

function setup() {
  return userRepositoryImpl(datasourcesMocks).getUser();
}

const spies = {
  getUser: getUserSpy,
};

const mocks = {
  getUserSuccess,
};

export { setup, spies, mocks };
