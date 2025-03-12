import {
  GoogleSignin,
  SignInResponse,
} from "@react-native-google-signin/google-signin";

import { signIn } from "@infrastructure/googleOAuth";
import * as monitoring from "@infrastructure/monitoring";

// #region mocks

const signInResponse = {
  data: {
    idToken: "google_sign_in_id_token",
  },
  type: "success",
} as SignInResponse;

const signInResponseWithoutToken = {
  data: {},
  type: "success",
} as SignInResponse;

const canceledResponse = {
  type: "cancelled",
} as SignInResponse;

const unknownResponse = {
  type: "unknown",
} as never as SignInResponse;

const mappedError = new Error("Google Sign In Throws");
const unknownError = new Error("[react-native-google-signin] - Unknown error");

// #endregion

const signInSpy = jest
  .spyOn(GoogleSignin, "signIn")
  .mockResolvedValue(signInResponse);
const hasPlayServicesSpy = jest.spyOn(GoogleSignin, "hasPlayServices");
const addBreadcrumbSpy = jest.spyOn(monitoring, "addBreadcrumb");

async function setup() {
  return signIn();
}

beforeEach(() => {
  jest.clearAllMocks();
});

export default {
  mocks: {
    canceledResponse,
    mappedError,
    signInResponse,
    signInResponseWithoutToken,
    unknownError,
    unknownResponse,
  },
  setup,
  spies: {
    addBreadcrumbSpy,
    hasPlayServicesSpy,
    signInSpy,
  },
};
