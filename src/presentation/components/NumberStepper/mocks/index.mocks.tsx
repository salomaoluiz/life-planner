import { render } from "@tests";

import { NumberStepper } from "@components";

const defaultProps = {
  accessibilityLabel: "Interval",
  decreaseLabel: "Decrease",
  increaseLabel: "Increase",
  max: 24,
  min: 1,
  onChange: jest.fn(),
  testID: "stepper",
  value: 2,
};

function setup(props?: Partial<React.ComponentProps<typeof NumberStepper>>) {
  render(<NumberStepper {...defaultProps} {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultProps, setup };
