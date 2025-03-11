import Icon, { IconProps } from "@components/Icon";
import { render } from "@tests";

const defaultProps: IconProps = {
  testID: "default-icon",
  name: "google",
  size: 20,
  color: "black",
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

export { setup, mocks };
export { screen } from "@tests";
