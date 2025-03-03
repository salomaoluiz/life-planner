import RNGoogleSignIn from "./rnGoogleSignIn";
import { SignInResult } from "./types";
import { isWeb } from "@utils/platform";

export function initialize() {
  if (isWeb()) {
    return;
  }
  RNGoogleSignIn.initialize();
}

export async function signIn(): Promise<SignInResult> {
  if (isWeb()) {
    throw new Error(
      "This library is not supported on web, use the supabase directly",
    );
  }

  return RNGoogleSignIn.signIn();
}

export async function signOut(): Promise<void> {
  if (isWeb()) {
    throw new Error(
      "This library is not supported on web, use the supabase directly",
    );
  }
  return RNGoogleSignIn.signOut();
}

const GoogleOAuth = {
  initialize,
  signIn,
  signOut,
};

export { GoogleOAuth };
