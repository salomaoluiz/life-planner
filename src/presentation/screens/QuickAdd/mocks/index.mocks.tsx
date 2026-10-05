import { router } from "expo-router";

import { render } from "@tests";

import QuickAdd from "../";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  render(<QuickAdd />);
}

const spies = {
  back: jest.mocked(router.back),
  replace: jest.mocked(router.replace),
};

export { setup, spies };
