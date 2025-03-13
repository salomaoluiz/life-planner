import signInMocks from "./mocks/signIn";

const { mocks, setup, spies } = signInMocks;

it("SHOULD sign in correctly", async () => {
  const result = await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    data: {
      token: "google_sign_in_id_token",
    },
    status: "success",
  });
});

it("SHOULD add breadcrumb when sign in succeeds", async () => {
  await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumbSpy).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumbSpy).toHaveBeenCalledWith({
    category: "react-native-google-signin",
    level: "info",
    message: "Successfully signed in with Google",
  });
});

it('SHOULD return "canceled" status when sign in is canceled', async () => {
  spies.signInSpy.mockResolvedValue(mocks.canceledResponse);

  const result = await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    status: "canceled",
  });
});

it('SHOULD return "error" status when sign in fails', async () => {
  const error = new Error("Google Sign In Throws");
  spies.signInSpy.mockRejectedValue(error);

  const result = await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    error,
    status: "error",
  });
});

it('SHOULD return "error" with default message when sign in fails', async () => {
  spies.signInSpy.mockRejectedValue(mocks.unknownError);

  const result = await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    error: mocks.unknownError,
    status: "error",
  });
});

it('SHOULD return "error" if sign in response is unknown', async () => {
  spies.signInSpy.mockResolvedValue(mocks.unknownResponse);

  const result = await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    error: new Error(
      `Google sign in failed: ${JSON.stringify(mocks.unknownResponse)}`,
    ),
    status: "error",
  });
});

it("SHOULD throw an error if sign in response is missing idToken", async () => {
  spies.signInSpy.mockResolvedValue(mocks.signInResponseWithoutToken);

  const result = await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    error: new Error("Google sign in failed: idToken is missing"),
    status: "error",
  });
});

it("SHOULD add breadcrumb when sign in fails", async () => {
  spies.signInSpy.mockRejectedValue(mocks.mappedError);

  await setup();

  expect(spies.hasPlayServicesSpy).toHaveBeenCalledTimes(1);
  expect(spies.signInSpy).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumbSpy).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumbSpy).toHaveBeenCalledWith({
    category: "react-native-google-signin",
    data: {
      message: mocks.mappedError.message,
    },
    level: "error",
    message: "Error signing in with Google",
  });
});
