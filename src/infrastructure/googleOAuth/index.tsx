import { isWeb } from "@utils/platform";

import * as RNGoogleSignIn from "./rnGoogleSignIn";
import { SignInResult } from "./types";

function initialize() {
  if (isWeb()) {
    return;
  }
  RNGoogleSignIn.initialize();
}

async function signIn(): Promise<SignInResult> {
  if (isWeb()) {
    throw new Error(
      "This library is not supported on web, use the supabase directly",
    );
  }

  return RNGoogleSignIn.signIn();
}

async function signOut(): Promise<void> {
  if (isWeb()) {
    throw new Error(
      "This library is not supported on web, use the supabase directly",
    );
  }
  return RNGoogleSignIn.signOut();
}

export { initialize, signIn, signOut };
