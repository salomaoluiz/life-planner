import { render } from "@tests";

import { Chip } from "@components";

const defaultProps = { label: "Food", onPress: jest.fn(), testID: "chip" };

function setup(props?: Partial<React.ComponentProps<typeof Chip>>) {
  render(<Chip {...defaultProps} {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultProps, setup };
