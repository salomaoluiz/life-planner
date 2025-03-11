import {
  act,
  mocks,
  setup,
  spies,
  suppressConsoleError,
} from "./mocks/hook.mocks";

it("SHOULD call the use case to execute", async () => {
  spies.executeUseCase.mockResolvedValue(mocks.execute.successResponse);

  const { result } = setup();

  await result.current.execute("Some Param");

  expect(spies.executeUseCase).toHaveBeenCalledTimes(1);
  expect(spies.executeUseCase).toHaveBeenCalledWith("Some Param");
});

it("SHOULD return the response from the use case", async () => {
  spies.executeUseCase.mockResolvedValue(mocks.execute.successResponse);

  const { result } = setup();

  const response = await result.current.execute("Some Param");

  expect(response).toBe(mocks.execute.successResponse);
});

it("SHOULD return the error from the use case", async () => {
  suppressConsoleError();
  spies.executeUseCase.mockRejectedValue(mocks.execute.errorResponse);

  const { result } = setup();

  try {
    await act(() => result.current.execute("Some Param"));
  } catch (error) {
    expect(error).toEqual(mocks.execute.errorResponse);
  }
});
