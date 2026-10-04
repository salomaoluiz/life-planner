import { useCases } from "@application/useCases";

import {
  mocks,
  screen,
  setup,
  setupHook,
  spies,
  throwableSetupWithoutProvider,
} from "./mocks/index.mocks";

it("SHOULD render the children component", () => {
  setup();

  expect(screen.getByTestId("user-provider-children")).toBeDefined();
});

it("SHOULD request the user data on mount", () => {
  setup();

  expect(spies.useQuery).toHaveBeenCalledTimes(1);
  expect(spies.useQuery).toHaveBeenCalledWith({
    cacheKey: ["user.get_user_use_case"],
    fetch: useCases.getUserUseCase.execute,
    retry: false,
  });
});

it("SHOULD request the user data on update", () => {
  const { result } = setupHook();

  result.current.update();

  expect(mocks.useQuery.pendingResponse.refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD return the user data", () => {
  spies.useQuery.mockReturnValue(mocks.useQuery.successResponse as never);

  const { result } = setupHook();

  expect(result.current.data).toEqual({
    profile: mocks.useQuery.successResponse.data,
  });
  expect(result.current.logged).toBeTruthy();
});

it("SHOULD throw in case of call hook outside the provider", () => {
  const error = throwableSetupWithoutProvider();

  expect(error).toEqual(
    new Error("useUser must be used within an UserProvider"),
  );
});

it("SHOULD subscribe to session expiry on mount and unsubscribe on unmount", () => {
  const { unmount } = setupHook();

  expect(spies.onSessionExpired).toHaveBeenCalledTimes(1);
  expect(spies.unsubscribe).not.toHaveBeenCalled();

  unmount();

  expect(spies.unsubscribe).toHaveBeenCalledTimes(1);
});

it("SHOULD reset the fetcher data WHEN the session expires", () => {
  setup();
  const listener = spies.onSessionExpired.mock.calls[0][0];

  listener();

  expect(spies.resetFetcherData).toHaveBeenCalledTimes(1);
});

it("SHOULD expose logged=false and no data WHEN the user query failed (not logged in)", () => {
  spies.useQuery.mockReturnValue(mocks.useQuery.errorResponse as never);

  const { result } = setupHook();

  expect(result.current.logged).toBe(false);
  expect(result.current.data).toBeUndefined();
});
