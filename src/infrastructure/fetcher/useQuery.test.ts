import { BusinessError, GenericError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/useQuery.mocks";

it("SHOULD fetch and return in success", async () => {
  spies.useReactQuery.mockReturnValueOnce(mocks.successResponse);

  const { result } = setup({
    cacheKey: ["cache-key-1", "cache-key-2"],
    fetch: spies.fetch,
  });

  expect(result.current.data).toEqual({ value: "success" });
  expect(result.current.error).toBeNull();
  expect(result.current.isFetching).toBeFalsy();
  expect(result.current.status).toBe("success");
});

it("SHOULD fetch and return in error", () => {
  spies.useReactQuery
    .mockReturnValueOnce(mocks.errorResponse)
    .mockReturnValueOnce(mocks.errorResponse);

  try {
    setup({
      cacheKey: ["CacheKey1", "CacheKey2"],
      fetch: spies.fetch,
    });
  } catch (e) {
    const error = e as GenericError;

    expect(error.message).toEqual("Error message");
    expect(error.stack).toEqual(expect.any(String));
    expect(error.context).toEqual({ cacheString: "CacheKey1-CacheKey2" });
  }
});

it("SHOULD fetch and return in business error", async () => {
  spies.useReactQuery.mockReturnValueOnce(mocks.businessErrorResponse);

  const { result } = setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
  });

  const businessError = new BusinessError();

  expect(result.current.error!.message).toEqual(businessError.message);
  expect(result.current.error!.stack).toEqual(expect.any(String));
  expect(result.current.error!.context).toEqual({
    cacheString: "CacheKey1-CacheKey2",
  });
  expect(result.current.data).toBeNull();
  expect(result.current.isFetching).toBeFalsy();
  expect(result.current.status).toBe("error");
});

it("SHOULD fetch and return in error without message", async () => {
  spies.useReactQuery
    .mockReturnValueOnce(mocks.errorWithoutMessageResponse)
    .mockReturnValueOnce(mocks.errorWithoutMessageResponse);

  try {
    setup({
      cacheKey: ["CacheKey1", "CacheKey2"],
      fetch: spies.fetch,
    });
  } catch (e) {
    const error = e as GenericError;

    expect(error.message).toEqual("Without error message");
    expect(error.context).toEqual({ cacheString: "CacheKey1-CacheKey2" });
    expect(error.stack).toEqual(expect.any(String));
  }
});

it("SHOULD return in pending", async () => {
  spies.useReactQuery.mockReturnValueOnce(mocks.pendingResponse as never);

  const { result } = setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
  });

  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeNull();
  expect(result.current.isFetching).toBeTruthy();
  expect(result.current.status).toBe("pending");
});

it("SHOULD refetch", async () => {
  spies.useReactQuery.mockReturnValueOnce(mocks.pendingResponse as never);

  const { result } = setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
  });

  await result.current.refetch();

  expect(mocks.pendingResponse.refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD call useQuery with default params", async () => {
  spies.useReactQuery.mockReturnValueOnce(mocks.pendingResponse as never);

  setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
  });

  expect(spies.useReactQuery).toHaveBeenCalledTimes(1);
  expect(spies.useReactQuery).toHaveBeenCalledWith({
    networkMode: "offlineFirst",
    queryFn: spies.fetch,
    queryKey: ["CacheKey1", "CacheKey2"],
    retry: undefined,
    retryDelay: undefined,
  });
});

it("SHOULD call useQuery with custom params", async () => {
  spies.useReactQuery.mockReturnValueOnce(mocks.pendingResponse as never);

  setup({
    cacheKey: ["CacheKey1", "CacheKey2"],
    fetch: spies.fetch,
    networkMode: "offlineFirst",
    retry: 3,
    retryDelay: 1000,
  });

  expect(spies.useReactQuery).toHaveBeenCalledTimes(1);
  expect(spies.useReactQuery).toHaveBeenCalledWith({
    networkMode: "offlineFirst",
    queryFn: spies.fetch,
    queryKey: ["CacheKey1", "CacheKey2"],
    retry: 3,
    retryDelay: 1000,
  });
});
