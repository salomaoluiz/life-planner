import { supabase } from "@infrastructure/supabase";
import * as googleOAuth from "@infrastructure/googleOAuth";
import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";
import { SignInResult, SignInStatus } from "@infrastructure/googleOAuth/types";

// region mocks
const signInError: SignInResult = {
  error: new Error("Error signing in"),
  status: SignInStatus.Error,
};

const signInSuccess: SignInResult = {
  data: { token: "token" },
  status: SignInStatus.Success,
};

const signInCanceled: SignInResult = { status: SignInStatus.Canceled };
// endregion mocks

const signInSpy = jest.spyOn(googleOAuth, "signIn");
const signInWithIdTokenSpy = jest.spyOn(supabase.auth, "signInWithIdToken");

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return loginDatasourceImpl().loginWithIdToken();
}

const spies = {
  signIn: signInSpy,
  signInWithIdToken: signInWithIdTokenSpy,
};

const mocks = {
  signInError,
  signInCanceled,
  signInSuccess,
};

export { setup, spies, mocks };
