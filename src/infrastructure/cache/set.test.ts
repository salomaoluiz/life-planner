import { setup, spies } from "./mocks/set.mocks";
import { CacheStringKeys } from "./types";

it("SHOULD set cache object", () => {
  setup(CacheStringKeys.CACHE_USER_DATA, { userId: "1" }, { TTL: 1000 });

  expect(spies.setCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.setCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
    {
      data: { userId: "1" },
      options: {
        timestamp: 1000 * 1000,
      },
    },
  );
});

it("SHOULD set cache object with default TTL", () => {
  setup(CacheStringKeys.CACHE_USER_DATA, { userId: "1" });

  expect(spies.setCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.setCacheObject).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
    {
      data: { userId: "1" },
      options: {
        timestamp: 3600 * 1000,
      },
    },
  );
});

it("SHOULD report a failed write without the cached data", () => {
  spies.setCacheObject.mockImplementationOnce(() => {
    throw new Error("error");
  });

  setup(CacheStringKeys.CACHE_USER_DATA, { userId: "1" }, { TTL: 1000 });

  expect(spies.setCacheObject).toHaveBeenCalledTimes(1);
  expect(spies.captureException).toHaveBeenCalledTimes(1);
  expect(spies.captureException).toHaveBeenCalledWith(new Error("error"), {
    bytes: JSON.stringify({ userId: "1" }).length,
    cacheKey: CacheStringKeys.CACHE_USER_DATA,
    options: { TTL: 1000 },
  });
  expect(
    Object.keys(spies.captureException.mock.calls[0][1] ?? {}),
  ).not.toContain("data");
});

it("SHOULD report a failed write even WHEN the data cannot be serialized", () => {
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  spies.setCacheObject.mockImplementationOnce(() => {
    throw new Error("error");
  });

  expect(() => setup(CacheStringKeys.CACHE_USER_DATA, circular)).not.toThrow();

  expect(spies.captureException).toHaveBeenCalledTimes(1);
  const context = spies.captureException.mock.calls[0][1] ?? {};
  expect(context).toHaveProperty("bytes", undefined);
  expect(Object.keys(context)).not.toContain("data");
});
