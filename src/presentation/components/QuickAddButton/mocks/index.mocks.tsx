import { render } from "@tests";

import QuickAddButton, { QuickAddButtonProps } from "../";

// region mocks
const defaultProps: QuickAddButtonProps = {
  label: "Add",
  onPress: jest.fn(),
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<QuickAddButtonProps>) {
  render(<QuickAddButton {...defaultProps} {...props} />);
}

const mocks = { defaultProps };

export { mocks, setup };
