import { api } from "@infrastructure/api";

import adjustAccountBalance from "../adjustAccountBalance";

jest.mock("@infrastructure/api", () => ({
  api: { post: jest.fn() },
}));

// region mocks
const params = { balance: 1200, id: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10" };
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 9, 15, 12, 0, 0) });
});

afterEach(() => {
  jest.useRealTimers();
});

async function setup(override: Partial<typeof params> = {}) {
  return adjustAccountBalance({ ...params, ...override });
}

async function setupThrowable(override: Partial<typeof params> = {}) {
  try {
    await setup(override);
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { params };

export { mocks, setup, setupThrowable, spies };
