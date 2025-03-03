import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { addBreadcrumb } from "@infrastructure/monitoring";

async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    addBreadcrumb({
      level: "error",
      category: "react-native-google-signin",
      message: "Error signing out with Google",
      data: {
        message: (error as Error).message,
      },
    });
  }
}

export default signOut;
