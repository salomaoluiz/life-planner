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
