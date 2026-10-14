import { render } from "@tests";

import { Switch, SwitchProps } from "@components";

const defaultProps: SwitchProps = {
  initialStatus: false,
  onToggle: jest.fn(),
  testID: "default-switch",
};

function setup(props?: Partial<SwitchProps>) {
  const { rerender } = render(<Switch {...defaultProps} {...props} />);

  return {
    rerenderWith: (next?: Partial<SwitchProps>) =>
      rerender(<Switch {...defaultProps} {...next} />),
  };
}

export { defaultProps, setup };
