import {
  GoogleSignin,
  SignInResponse,
} from "@react-native-google-signin/google-signin";

import { SignInResult, SignInStatus } from "@infrastructure/googleOAuth/types";
import { addBreadcrumb } from "@infrastructure/monitoring";

function handleSignIn(result: SignInResponse): SignInResult {
  if (result.type === "success") {
    if (!result.data.idToken) {
      throw new Error("Google sign in failed: idToken is missing");
    }

    addBreadcrumb({
      category: "react-native-google-signin",
      level: "info",
      message: "Successfully signed in with Google",
    });

    return {
      data: {
        token: result.data.idToken,
      },
      status: SignInStatus.Success,
    };
  }
  if (result.type === "cancelled") {
    addBreadcrumb({
      category: "react-native-google-signin",
      level: "info",
      message: "Google sign in was cancelled",
    });

    return {
      status: SignInStatus.Canceled,
    };
  }

  throw new Error(`Google sign in failed: ${JSON.stringify(result)}`);
}

async function signIn(): Promise<SignInResult> {
  try {
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    return handleSignIn(result);
  } catch (error) {
    const errorMessage =
      (error as Error).message ??
      "[react-native-google-signin] - Unknown error";

    addBreadcrumb({
      category: "react-native-google-signin",
      data: {
        message: errorMessage,
      },
      level: "error",
      message: "Error signing in with Google",
    });

    return {
      error: new Error(errorMessage),
      status: SignInStatus.Error,
    };
  }
}

export default signIn;
