import { add } from "../add";

// region mocks

// endregion mocks

// region spies
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(...params: Parameters<typeof add>) {
  return add(...params);
}

const spies = {};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
