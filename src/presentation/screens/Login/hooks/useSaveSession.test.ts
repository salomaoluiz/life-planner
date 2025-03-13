import { mocks, setup, spies } from "./mocks/useSaveSession.mocks";

it("SHOULD call hooks with the correct parameters WHEN the hook is called", () => {
  setup();

  expect(spies.useUser).toHaveBeenCalledTimes(1);
  expect(spies.useUser).toHaveBeenCalledWith();
  expect(spies.useMutation).toHaveBeenCalledTimes(1);
  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: [mocks.useCases.saveWebSessionUseCase.uniqueName],
    fetch: mocks.useCases.saveWebSessionUseCase.execute,
  });
});

it("SHOULD call the update function WHEN the status is success", () => {
  spies.useMutation.mockReturnValueOnce(mocks.useMutationMockSuccess as never);

  setup();

  expect(mocks.useUserMock.update).toHaveBeenCalled();
  expect(mocks.useUserMock.update).toHaveBeenCalledTimes(1);
});

it('SHOULD not call the update function WHEN the status is not "success"', () => {
  spies.useMutation.mockReturnValueOnce(mocks.useMutationMockError as never);

  setup();

  expect(mocks.useUserMock.update).not.toHaveBeenCalled();
});

it("SHOULD call the mutate function WITH the hash WHEN the hook is called", () => {
  setup();

  expect(mocks.useMutationMockSuccess.mutate).toHaveBeenCalledTimes(1);
  expect(mocks.useMutationMockSuccess.mutate).toHaveBeenCalledWith(
    mocks.hashMock,
  );
});

it("SHOULD return the error and isFetching", () => {
  const {
    result: {
      current: { error, isFetching },
    },
  } = setup();

  expect(error).toBe(mocks.useMutationMockSuccess.error);
  expect(isFetching).toBe(mocks.useMutationMockSuccess.isFetching);
});
