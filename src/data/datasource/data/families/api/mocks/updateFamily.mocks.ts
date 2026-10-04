import { api } from "@infrastructure/api";

import updateFamily from "../updateFamily";

jest.mock("@infrastructure/api", () => ({
  api: { patch: jest.fn() },
}));

// region mocks
const params = {
  id: "6f1c2a52-3d1e-4c8e-9a3b-1b2c3d4e5f60",
  name: "Renamed Family",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return updateFamily(params);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { patch: jest.mocked(api.patch) };
const mocks = { params };

export { mocks, setup, setupThrowable, spies };
