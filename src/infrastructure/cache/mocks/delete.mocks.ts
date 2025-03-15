import { cacheStorage } from "@infrastructure/storage";

import { invalidate, invalidateAll } from "../delete";

// region mocks

// endregion mocks

// region spies
const deleteCacheSpy = jest.spyOn(cacheStorage, "deleteCache");
const deleteAllCacheSpy = jest.spyOn(cacheStorage, "deleteAllCache");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

const setup = {
  invalidate,
  invalidateAll,
};

const spies = {
  deleteAllCache: deleteAllCacheSpy,
  deleteCache: deleteCacheSpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
