import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { addBreadcrumb } from "@infrastructure/monitoring";

async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    addBreadcrumb({
      category: "react-native-google-signin",
      data: {
        message: (error as Error).message,
      },
      level: "error",
      message: "Error signing out with Google",
    });
  }
}

export default signOut;
