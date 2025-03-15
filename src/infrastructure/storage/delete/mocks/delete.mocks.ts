import { cache, storage } from "@infrastructure/storage/init";

import { deleteAllCache, deleteCache, deleteItem } from "../delete";

// region mocks

// endregion mocks

// region spies
const storageDeleteSpy = jest.spyOn(storage, "delete");
const cacheClearAllSpy = jest.spyOn(cache, "clearAll");
const cacheDeleteSpy = jest.spyOn(cache, "delete");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

const setup = {
  deleteAllCache,
  deleteCache,
  deleteItem,
};

const spies = {
  cache: {
    clearAll: cacheClearAllSpy,
    delete: cacheDeleteSpy,
  },
  storage: {
    delete: storageDeleteSpy,
  },
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
