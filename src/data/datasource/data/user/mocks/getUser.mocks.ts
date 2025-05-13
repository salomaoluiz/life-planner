import { UserResponse } from "@supabase/auth-js";

import { supabase } from "@infrastructure/supabase";

import getUser from "../getUser";

// region mocks

const unknownError = {
  data: null,
  error: new Error("Some error"),
} as unknown as UserResponse;

const authSessionMissingError = {
  data: null,
  error: {
    code: "auth/session-missing",
    message: "Auth session is missing",
    name: "AuthSessionMissingError",
  },
} as unknown as UserResponse;

const userNotFoundError = {
  data: null,
  error: {
    code: "user_not_found",
    message: "User not found",
    name: "UserNotFoundError",
  },
} as unknown as UserResponse;

const successResponse = {
  data: {
    user: {
      id: "ee793202-6891-4c7d-b4d4-39c51b2536b0",
      user_metadata: {
        avatar_url: "https://example.com/avatar.png",
        email: "teste@gmail.com",
        name: "Test User",
      },
    },
  },
  error: null,
} as unknown as UserResponse;

// endregion mocks

// region spies
const getUserSpy = jest.spyOn(supabase.auth, "getUser");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getUser();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  getUser: getUserSpy,
};

const mocks = {
  errors: {
    authSessionMissing: authSessionMissingError,
    unknown: unknownError,
    userNotFound: userNotFoundError,
  },
  success: {
    response: successResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
