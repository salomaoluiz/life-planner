import { render } from "@tests";
import Welcome from "../";

// region mocks

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  render(<Welcome />);
}

const spies = {};

const mocks = {};

export { setup, spies, mocks };
export { screen } from "@tests";
