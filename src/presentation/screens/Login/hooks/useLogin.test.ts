import { mocks, setup, spies } from "./mocks/useLogin.mocks";

it("SHOULD call useMutation with the correct parameters WHEN the hook is called", () => {
  spies.useMutation.mockReturnValue(mocks.useMutationMockSuccess as never);

  setup();

  expect(spies.useMutation).toHaveBeenCalledTimes(1);
  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: [mocks.useCases.loginWithGoogleUseCase.uniqueName],
    fetch: mocks.useCases.loginWithGoogleUseCase.execute,
  });
});

it("SHOULD call addBreadcrumb with the correct parameters WHEN onGoogleButtonPress is called", () => {
  const { result } = setup();
  result.current.onGoogleButtonPress();

  expect(spies.addBreadcrumb).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumb).toHaveBeenCalledWith({
    category: "user-action",
    level: "info",
    message: "User pressed the Google button",
  });
});

it("SHOULD call mutate WHEN onGoogleButtonPress is called", () => {
  const { result } = setup();

  result.current.onGoogleButtonPress();

  expect(mocks.useMutationMockSuccess.mutate).toHaveBeenCalledTimes(1);
});

it("SHOULD call update WHEN status is success and is not web", () => {
  spies.isWeb.mockReturnValue(false);

  const { result } = setup();
  result.current.onGoogleButtonPress();

  expect(mocks.useUserMock.update).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT call update WHEN status is not success", () => {
  spies.useMutation.mockReturnValue(mocks.useMutationMockPending as never);

  const { result } = setup();
  result.current.onGoogleButtonPress();

  expect(mocks.useUserMock.update).not.toHaveBeenCalled();
});

it("SHOULD NOT call update WHEN is web", () => {
  spies.isWeb.mockReturnValue(true);

  const { result } = setup();
  result.current.onGoogleButtonPress();

  expect(mocks.useUserMock.update).not.toHaveBeenCalled();
});
