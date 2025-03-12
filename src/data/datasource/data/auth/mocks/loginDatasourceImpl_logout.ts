import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";
import { supabase } from "@infrastructure/supabase";

// region mocks

const signOutError = { error: new Error("Error signing in") };

const signOutSuccess = {};

// endregion mocks

const signOutSpy = jest.spyOn(supabase.auth, "signOut");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginDatasourceImpl().logout();
}

const spies = {
  signOut: signOutSpy,
};

const mocks = {
  signOutError,
  signOutSuccess,
};

export { mocks, setup, spies };
