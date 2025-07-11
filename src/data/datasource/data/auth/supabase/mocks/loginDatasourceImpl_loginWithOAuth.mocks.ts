import loginDatasourceImpl from "@data/datasource/data/auth/supabase/loginDatasourceImpl";
import { supabase } from "@infrastructure/supabase";

// region mocks
process.env = {
  EXPO_PUBLIC_PROJECT_WEBSITE_URL: "https://project-website-url.com",
  NODE_ENV: "test",
};

const signInError = { error: new Error("Error signing in") };

const signInSuccess = { error: null };

// endregion mocks

const signInWithOAuthSpy = jest.spyOn(supabase.auth, "signInWithOAuth");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginDatasourceImpl().loginWithOAuth();
}

const spies = {
  signInWithOAuth: signInWithOAuthSpy,
};

const mocks = {
  signInError,
  signInSuccess,
};

export { mocks, setup, spies };
