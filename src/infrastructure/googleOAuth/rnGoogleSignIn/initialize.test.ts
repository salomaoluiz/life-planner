import mocksInitialize from "@infrastructure/googleOAuth/rnGoogleSignIn/mocks/initialize";

const { mocks, setup, spies } = mocksInitialize;

it("SHOULD initialize correctly", () => {
  setup();

  expect(spies.configureSpy).toHaveBeenCalledTimes(1);
  expect(spies.configureSpy).toHaveBeenCalledWith({
    iosClientId: "google_sign_in_ios_client_id",
    offlineAccess: true,
    webClientId: "google_sign_in_web_client_id",
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
    message: "Error initializing React Native Google Sign-In",
    name: "GoogleSignInInitializationError",
  });
});
