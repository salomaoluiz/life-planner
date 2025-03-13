import { render } from "@tests";

import Icon, { IconProps } from "@components/Icon";

const defaultProps: IconProps = {
  color: "black",
  name: "google",
  size: 20,
  testID: "default-icon",
};

function setup(props?: Partial<IconProps>): void {
  render(<Icon {...defaultProps} {...props} />);
}

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup };
export { screen } from "@tests";
