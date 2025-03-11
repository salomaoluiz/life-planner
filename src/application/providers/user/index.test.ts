import {
  mocks,
  setup,
  screen,
  setupHook,
  spies,
  act,
} from "./mocks/index.mocks";

it("SHOULD render the children component", () => {
  setup();

  expect(screen.getByTestId("user-provider-children")).toBeDefined();
});

it("SHOULD request the user data on mount", () => {
  setup();

  expect(spies.getUserUseCase).toHaveBeenCalledTimes(1);
});

it("SHOULD request the user data on update", () => {
  const { result } = setupHook();

  result.current.update();

  expect(spies.getUserUseCase).toHaveBeenCalledTimes(2);
});

it("SHOULD update the user data and logged status", async () => {
  spies.getUserUseCase
    .mockResolvedValueOnce(mocks.getUserUseCase.errorResponse)
    .mockResolvedValueOnce(mocks.getUserUseCase.successResponse);

  const { result, rerender } = setupHook();

  expect(result.current.data).toBeUndefined();
  expect(result.current.logged).toBeFalsy();

  await act(() => result.current.update());

  rerender({});

  expect(result.current.data).toEqual({
    profile: mocks.getUserUseCase.successResponse,
  });
  expect(result.current.logged).toBeTruthy();
});
