import * as monitoring from "@infrastructure/monitoring";
import { cacheStorage } from "@infrastructure/storage";

import { set } from "../set";

// region mocks

// endregion mocks

// region spies
const setCacheObjectSpy = jest.spyOn(cacheStorage, "setCacheObject");
const captureExceptionSpy = jest.spyOn(monitoring, "captureException");
jest.spyOn(Date, "now").mockReturnValue(0);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(...props: Parameters<typeof set>) {
  return set(...props);
}

const spies = {
  captureException: captureExceptionSpy,
  setCacheObject: setCacheObjectSpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
