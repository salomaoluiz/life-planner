import { render } from "@tests";
import LoginContainer, { Props } from "../";

// region mocks
const defaultProps = {
  onGoogleButtonPress: jest.fn(),
} as Props;

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<Props>) {
  render(<LoginContainer {...defaultProps} {...props} />);
}

const spies = {};

const mocks = {
  defaultProps,
};

export { setup, spies, mocks };
export { screen } from "@tests";
