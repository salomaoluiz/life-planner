import {
  GoogleSignin,
  SignInResponse,
} from "@react-native-google-signin/google-signin";
import * as monitoring from "@infrastructure/monitoring";
import { signIn } from "@infrastructure/googleOAuth";

// #region mocks

const signInResponse = {
  type: "success",
  data: {
    idToken: "google_sign_in_id_token",
  },
} as SignInResponse;

const signInResponseWithoutToken = {
  type: "success",
  data: {},
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
  setup,
  spies: {
    signInSpy,
    hasPlayServicesSpy,
    addBreadcrumbSpy,
  },
  mocks: {
    signInResponse,
    signInResponseWithoutToken,
    canceledResponse,
    unknownResponse,
    unknownError,
    mappedError,
  },
};
