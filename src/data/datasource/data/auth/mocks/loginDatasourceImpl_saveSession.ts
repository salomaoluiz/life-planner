import { supabase } from "@infrastructure/supabase";
import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";

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

function setup() {
  return loginDatasourceImpl().saveSession({
    accessToken: "accessToken",
    refreshToken: "refreshToken",
  });
}

const spies = {
  setSession: setSessionSpy,
};

const mocks = {
  signInSuccess,
  authSessionMissingError,
  setSessionError,
};

export { setup, spies, mocks };
