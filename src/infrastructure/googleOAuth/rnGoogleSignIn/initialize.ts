import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { captureException } from "@infrastructure/monitoring";

function initialize() {
  try {
    const envVars = process.env;

    const options = {
      iosClientId: envVars.EXPO_PUBLIC_GOOGLE_SIGN_IN_IOS_CLIENT_ID,
      offlineAccess: true,
      webClientId: envVars.EXPO_PUBLIC_GOOGLE_SIGN_IN_WEB_CLIENT_ID,
    };

    GoogleSignin.configure(options);
  } catch (error) {
    captureException({
      cause: error,
      message: "Error initializing React Native Google Sign-In",
      name: "GoogleSignInInitializationError",
    });
  }
}

export default initialize;
