import * as monitoring from "@infrastructure/monitoring";
import { cacheStorage } from "@infrastructure/storage";

import * as deleteCache from "../delete";
import { get } from "../get";

// region mocks
const successCacheObject = {
  data: {
    userId: "1",
  },
  options: {
    timestamp: Date.now() + 1000,
  },
};

const expiredCacheObject = {
  data: {
    userId: "1",
  },
  options: {
    timestamp: Date.now() - 1000,
  },
};
// endregion mocks

// region spies
const getCacheObjectSpy = jest.spyOn(cacheStorage, "getCacheObject");
const invalidateSpy = jest.spyOn(deleteCache, "invalidate");
const captureExceptionSpy = jest.spyOn(monitoring, "captureException");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(...params: Parameters<typeof get>) {
  return get(...params);
}

const spies = {
  captureException: captureExceptionSpy,
  getCacheObject: getCacheObjectSpy,
  invalidate: invalidateSpy,
};

const mocks = {
  expiredCacheObject,
  successCacheObject,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
