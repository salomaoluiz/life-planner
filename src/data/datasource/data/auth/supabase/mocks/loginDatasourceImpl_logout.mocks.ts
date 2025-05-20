import loginDatasourceImpl from "@data/datasource/data/auth/supabase/loginDatasourceImpl";
import { supabase } from "@infrastructure/supabase";

// region mocks

const unknownSignOutError = { error: new Error("Error signing in") } as never;

const signOutSuccess = {} as never;

const authSessionMissingError = {
  error: {
    name: "AuthSessionMissingError",
  },
} as never;

// endregion mocks

const signOutSpy = jest.spyOn(supabase.auth, "signOut");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginDatasourceImpl().logout();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  signOut: signOutSpy,
};

const mocks = {
  errors: {
    authSessionMissing: authSessionMissingError,
    unknown: unknownSignOutError,
  },
  success: signOutSuccess,
};

export { mocks, setup, setupThrowable, spies };
