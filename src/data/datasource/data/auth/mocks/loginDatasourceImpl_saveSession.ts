import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";
import { supabase } from "@infrastructure/supabase";

// region mocks
const authSessionMissingError = {
  error: { name: "AuthSessionMissingError" },
};

const setSessionError = { error: new Error("Error setting session") };

const signInSuccess = {};

// endregion mocks

const setSessionSpy = jest.spyOn(supabase.auth, "setSession");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginDatasourceImpl().saveSession({
    accessToken: "accessToken",
    refreshToken: "refreshToken",
  });
}

const spies = {
  setSession: setSessionSpy,
};

const mocks = {
  authSessionMissingError,
  setSessionError,
  signInSuccess,
};

export { mocks, setup, spies };
