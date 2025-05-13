import { Dimensions } from "react-native";

import * as device from "../device";

// region mocks
const screenSizesMocks = {
  fontScale: 1,
  height: 800,
  scale: 1,
  width: 600,
};

const windowSizesMocks = {
  fontScale: 1,
  height: 700,
  scale: 1,
  width: 500,
};

// endregion mocks

// region spies
const getSpy = jest.spyOn(Dimensions, "get");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

const setup = {
  getScreenSizes: () => device.getScreenSizes(),
  getWindowsSizes: () => device.getWindowsSizes(),
};

const spies = {
  get: getSpy,
};

const mocks = {
  screenSizes: screenSizesMocks,
  windowSizes: windowSizesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
