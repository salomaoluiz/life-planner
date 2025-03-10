import { GoogleSignin } from "@react-native-google-signin/google-signin";

import * as RNGoogleSignIn from "@infrastructure/googleOAuth/rnGoogleSignIn";
import * as monitoring from "@infrastructure/monitoring";

// #region mocks

process.env = {
  NODE_ENV: "test",
  EXPO_PUBLIC_GOOGLE_SIGN_IN_WEB_CLIENT_ID: "google_sign_in_web_client_id",
  EXPO_PUBLIC_GOOGLE_SIGN_IN_IOS_CLIENT_ID: "google_sign_in_ios_client_id",
};

const failError = new Error("Google Sign In Throws");

// #endregion

const configureSpy = jest.spyOn(GoogleSignin, "configure");
const captureExceptionSpy = jest.spyOn(monitoring, "captureException");

function setup() {
  return RNGoogleSignIn.initialize();
}

beforeEach(() => {
  jest.clearAllMocks();
});

export default {
  setup,
  spies: {
    configureSpy,
    captureExceptionSpy,
  },
  mocks: {
    failError,
  },
};
