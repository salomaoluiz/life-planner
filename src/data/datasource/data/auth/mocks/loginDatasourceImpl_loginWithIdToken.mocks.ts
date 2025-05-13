import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";
import * as googleOAuth from "@infrastructure/googleOAuth";
import { SignInResult, SignInStatus } from "@infrastructure/googleOAuth/types";
import { supabase } from "@infrastructure/supabase";

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

const signInWithIdTokenResponseMock = {
  data: {
    user: {
      email: "teste@gmail.com",
      id: "168056e6-9e98-4c1e-a7a8-6e41bde50098",
      user_metadata: {
        avatar_url: "https://example.com/avatar.jpg",
        name: "Test User",
      },
    },
  },
  error: null,
};

// endregion mocks

const signInSpy = jest.spyOn(googleOAuth, "signIn");
const signInWithIdTokenSpy = jest.spyOn(supabase.auth, "signInWithIdToken");
signInWithIdTokenSpy.mockResolvedValue(signInWithIdTokenResponseMock as never);

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginDatasourceImpl().loginWithIdToken();
}

const spies = {
  signIn: signInSpy,
  signInWithIdToken: signInWithIdTokenSpy,
};

const mocks = {
  signInCanceled,
  signInError,
  signInSuccess,
  signInWithIdTokenResponse: signInWithIdTokenResponseMock,
};

export { mocks, setup, spies };
