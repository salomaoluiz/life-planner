import { render } from "@tests";
import { Switch, SwitchProps } from "@components";

const defaultProps: SwitchProps = {
  testID: "default-switch",
  initialStatus: false,
  onToggle: jest.fn(),
};

const setup = (props?: Partial<SwitchProps>) =>
  render(<Switch {...defaultProps} {...props} />);

export { setup, defaultProps };
