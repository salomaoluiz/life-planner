import userDatasourceImpl from "@data/datasource/data/user/userDatasourceImpl";
import { supabase } from "@infrastructure/supabase";

// region mocks

const authSessionMissingError = { error: { name: "AuthSessionMissingError" } };

const getUserError = { error: new Error("Error getting user") };

const getUserSuccess = {
  data: {
    user: {
      user_metadata: {
        avatar_url: "https://avatar.com",
        email: "user_email@email.com",
        id: "0092abf9-3a76-4063-a3e5-76ce873cb285",
        name: "User Name",
      },
    },
  },
};

// endregion mocks

const getUserSpy = jest.spyOn(supabase.auth, "getUser");

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return userDatasourceImpl().getUser();
}

const spies = {
  getUser: getUserSpy,
};

const mocks = {
  authSessionMissingError,
  getUserError,
  getUserSuccess,
};

export { mocks, setup, spies };
