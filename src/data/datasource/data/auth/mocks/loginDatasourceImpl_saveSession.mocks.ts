import loginDatasourceImpl from "@data/datasource/data/auth/loginDatasourceImpl";
import { supabase } from "@infrastructure/supabase";

// region mocks
const authSessionMissingError = {
  error: { name: "AuthSessionMissingError" },
} as never;

const unknownError = { error: new Error("Error setting session") } as never;
const unknownNamedError = {
  error: { name: "UnknownError" },
} as never;

const signInSuccess = {} as never;

const setSessionResponseMock = {
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

const setSessionSpy = jest.spyOn(supabase.auth, "setSession");
setSessionSpy.mockResolvedValue(setSessionResponseMock as never);

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return loginDatasourceImpl().saveSession({
    accessToken: "accessToken",
    refreshToken: "refreshToken",
  });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  setSession: setSessionSpy,
};

const mocks = {
  errors: {
    authSessionMissing: authSessionMissingError,
    unknown: unknownError,
    unknownNamed: unknownNamedError,
  },
  setSessionResponse: setSessionResponseMock,
  signInSuccess,
};

export { mocks, setup, setupThrowable, spies };
