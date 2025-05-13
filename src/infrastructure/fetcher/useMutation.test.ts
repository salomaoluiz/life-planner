import { BusinessError, GenericError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/useMutation.mocks";

it("SHOULD fetch and return in success", async () => {
  spies.useReactMutation.mockReturnValueOnce(mocks.successResponse as never);

  const { result } = setup({
    cacheKey: ["cache-key-1", "cache-key-2"],
    fetch: spies.fetch,
  });

  expect(result.current.error).toBeNull();
  expect(result.current.data).toEqual({ value: "success" });
  expect(result.current.isFetching).toBeFalsy();
  expect(result.current.status).toBe("success");
});

it("SHOULD fetch and return in error", async () => {
  spies.useReactMutation
    .mockReturnValueOnce(mocks.errorResponse as never)
    .mockReturnValueOnce(mocks.errorResponse as never);

  try {
    setup({
      cacheKey: ["CacheKey1", "CacheKey2"],
      fetch: spies.fetch,
    });
  } catch (e) {
    const error = e as GenericError;

    expect(error.message).toEqual("Error message");
    expect(error.stack).toEqual(expect.any(String));
    expect(error.context).toEqual({
      cacheString: "CacheKey1-CacheKey2",
      variables: mocks.errorResponse.variables,
    });
  }
});

it("SHOULD fetch and return in business error", async () => {
  spies.useReactMutation.mockReturnValueOnce(
    mocks.businessErrorResponse as never,
  );

  const { result } = setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
  });

  const businessError = new BusinessError();

  expect(result.current.error!.stack).toEqual(expect.any(String));
  expect(result.current.error!.message).toEqual(businessError.message);
  expect(result.current.error!.context).toEqual({
    cacheString: "CacheKey1-CacheKey2",
    variables: mocks.businessErrorResponse.variables,
  });
  expect(result.current.data).toBeNull();
  expect(result.current.isFetching).toBeFalsy();
  expect(result.current.status).toBe("error");
});

it("SHOULD fetch and return in error without message", async () => {
  spies.useReactMutation
    .mockReturnValueOnce(mocks.errorWithoutMessageResponse as never)
    .mockReturnValueOnce(mocks.errorWithoutMessageResponse as never);

  try {
    setup({
      cacheKey: ["CacheKey1", "CacheKey2"],
      fetch: spies.fetch,
    });
  } catch (e) {
    const error = e as GenericError;

    expect(error.message).toEqual("Without error message");
    expect(error.context).toEqual({
      cacheString: "CacheKey1-CacheKey2",
      variables: mocks.errorWithoutMessageResponse.variables,
    });
    expect(error.stack).toEqual(expect.any(String));
  }
});

it("SHOULD return in pending", async () => {
  spies.useReactMutation.mockReturnValueOnce(mocks.pendingResponse as never);

  const { result } = setup({
    cacheKey: ["CacheKey3", "CacheKey2"],
    fetch: spies.fetch,
  });

  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeNull();
  expect(result.current.isFetching).toBeTruthy();
  expect(result.current.status).toBe("pending");
});

it("SHOULD call useMutation with default params", async () => {
  spies.useReactMutation.mockReturnValueOnce(mocks.pendingResponse as never);

  setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
  });

  expect(spies.useReactMutation).toHaveBeenCalledTimes(1);
  expect(spies.useReactMutation).toHaveBeenCalledWith({
    mutationFn: spies.fetch,
    mutationKey: ["CacheKey1", "CacheKey2"],
    retry: undefined,
    retryDelay: undefined,
  });
});

it("SHOULD call useMutation with custom params", async () => {
  spies.useReactMutation.mockReturnValueOnce(mocks.pendingResponse as never);

  setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
    retry: 3,
    retryDelay: 1000,
  });

  expect(spies.useReactMutation).toHaveBeenCalledTimes(1);
  expect(spies.useReactMutation).toHaveBeenCalledWith({
    mutationFn: spies.fetch,
    mutationKey: ["CacheKey1", "CacheKey2"],
    retry: 3,
    retryDelay: 1000,
  });
});
