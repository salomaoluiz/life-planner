import { supabase } from "@infrastructure/supabase";
import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";

// region mocks

const signOutError = { error: new Error("Error signing in") };

const signOutSuccess = {};

// endregion mocks

const signOutSpy = jest.spyOn(supabase.auth, "signOut");

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return loginDatasourceImpl().logout();
}

const spies = {
  signOut: signOutSpy,
};

const mocks = {
  signOutError,
  signOutSuccess,
};

export { setup, spies, mocks };
