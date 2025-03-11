import {
  GoogleSignin,
  SignInResponse,
} from "@react-native-google-signin/google-signin";
import { addBreadcrumb } from "@infrastructure/monitoring";
import { SignInResult, SignInStatus } from "@infrastructure/googleOAuth/types";

async function signIn(): Promise<SignInResult> {
  try {
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    return handleSignIn(result);
  } catch (error) {
    const errorMessage =
      (error as Error).message ||
      "[react-native-google-signin] - Unknown error";

    addBreadcrumb({
      level: "error",
      category: "react-native-google-signin",
      message: "Error signing in with Google",
      data: {
        message: errorMessage,
      },
    });

    return {
      error: new Error(errorMessage),
      status: SignInStatus.Error,
    };
  }
}

function handleSignIn(result: SignInResponse): SignInResult {
  if (result.type === "success") {
    if (!result.data.idToken) {
      throw new Error("Google sign in failed: idToken is missing");
    }

    addBreadcrumb({
      level: "info",
      category: "react-native-google-signin",
      message: "Successfully signed in with Google",
    });

    return {
      status: SignInStatus.Success,
      data: {
        token: result.data.idToken,
      },
    };
  }
  if (result.type === "cancelled") {
    addBreadcrumb({
      level: "info",
      category: "react-native-google-signin",
      message: "Google sign in was cancelled",
    });

    return {
      status: SignInStatus.Canceled,
    };
  }

  throw new Error(`Google sign in failed: ${JSON.stringify(result)}`);
}

export default signIn;
