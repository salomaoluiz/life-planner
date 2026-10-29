import { render } from "@tests";

import Fab, { FabProps } from "../";

// region mocks
const defaultProps: FabProps = {
  label: "New",
  onPress: jest.fn(),
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<FabProps>) {
  render(<Fab {...defaultProps} {...props} />);
}

const mocks = { defaultProps };

export { mocks, setup };
