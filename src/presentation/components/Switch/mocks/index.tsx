import { Switch, SwitchProps } from "@components";
import { render } from "@tests";

const defaultProps: SwitchProps = {
  initialStatus: false,
  onToggle: jest.fn(),
  testID: "default-switch",
};

const setup = (props?: Partial<SwitchProps>) =>
  render(<Switch {...defaultProps} {...props} />);

export { defaultProps, setup };
