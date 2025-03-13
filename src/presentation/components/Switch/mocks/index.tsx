import { render } from "@tests";

import { Switch, SwitchProps } from "@components";

const defaultProps: SwitchProps = {
  initialStatus: false,
  onToggle: jest.fn(),
  testID: "default-switch",
};

function setup(props?: Partial<SwitchProps>) {
  render(<Switch {...defaultProps} {...props} />);
}

export { defaultProps, setup };
