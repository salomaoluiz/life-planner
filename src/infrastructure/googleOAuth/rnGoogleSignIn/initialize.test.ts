import mocksInitialize from "@infrastructure/googleOAuth/rnGoogleSignIn/mocks/initialize";

const { setup, spies, mocks } = mocksInitialize;

it("SHOULD initialize correctly", () => {
  setup();

  expect(spies.configureSpy).toHaveBeenCalledTimes(1);
  expect(spies.configureSpy).toHaveBeenCalledWith({
    webClientId: "google_sign_in_web_client_id",
    iosClientId: "google_sign_in_ios_client_id",
    offlineAccess: true,
  });
});

it("SHOULD add breadcrumb when initialization fails", () => {
  spies.configureSpy.mockImplementation(() => {
    throw mocks.failError;
  });

  setup();

  expect(spies.configureSpy).toHaveBeenCalledTimes(1);
  expect(spies.captureExceptionSpy).toHaveBeenCalledTimes(1);
  expect(spies.captureExceptionSpy).toHaveBeenCalledWith({
    cause: mocks.failError,
    name: "GoogleSignInInitializationError",
    message: "Error initializing React Native Google Sign-In",
  });
});
