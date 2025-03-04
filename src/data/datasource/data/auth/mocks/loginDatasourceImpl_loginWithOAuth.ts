import { supabase } from "@infrastructure/supabase";
import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";

// region mocks
process.env = {
  NODE_ENV: "test",
  EXPO_PUBLIC_PROJECT_WEBSITE_URL: "https://project-website-url.com",
};

const signInError = { error: new Error("Error signing in") };

const signInSuccess = { error: null };

// endregion mocks

const signInWithOAuthSpy = jest.spyOn(supabase.auth, "signInWithOAuth");

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return loginDatasourceImpl().loginWithOAuth();
}

const spies = {
  signInWithOAuth: signInWithOAuthSpy,
};

const mocks = {
  signInError,
  signInSuccess,
};

export { setup, spies, mocks };
