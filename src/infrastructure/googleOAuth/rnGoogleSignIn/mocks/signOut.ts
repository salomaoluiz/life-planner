import { GoogleSignin } from "@react-native-google-signin/google-signin";

import * as RNGoogleSignIn from "@infrastructure/googleOAuth/rnGoogleSignIn";
import * as monitoring from "@infrastructure/monitoring";

// #region mocks

const failError = new Error("Google Sign Out Throws");

// #endregion

const signOutSpy = jest.spyOn(GoogleSignin, "signOut");
const addBreadcrumbSpy = jest.spyOn(monitoring, "addBreadcrumb");

async function setup() {
  return RNGoogleSignIn.signOut();
}

beforeEach(() => {
  jest.clearAllMocks();
});

export default {
  mocks: {
    failError,
  },
  setup,
  spies: {
    addBreadcrumbSpy,
    signOutSpy,
  },
};
