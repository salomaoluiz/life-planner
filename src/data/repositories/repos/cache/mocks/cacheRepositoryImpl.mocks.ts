import cacheRepositoryImpl from "../cacheRepositoryImpl";
import * as invalidate from "../invalidate";

// region mocks

// endregion mocks

// region spies

const invalidateSpy = jest
  .spyOn(invalidate, "default")
  .mockResolvedValue("invalidate response" as never);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return cacheRepositoryImpl();
}

const spies = {
  invalidate: invalidateSpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
