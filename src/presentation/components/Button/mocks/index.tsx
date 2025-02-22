import { render } from "@tests";
import { Button, ButtonProps } from "@components";
import { ButtonMode } from "@components/Button";

const defaultProps: ButtonProps = {
  testID: "default-button",
  onPress: jest.fn(),
  label: "Button Label",
};

const renderComponent = (
  props?: Partial<ButtonProps & { mode: ButtonMode }>,
) => {
  switch (props?.mode) {
    case ButtonMode.Outlined:
      return <Button.Outlined {...defaultProps} {...props} />;
    case ButtonMode.Text:
      return <Button.Text {...defaultProps} {...props} />;
    case ButtonMode.Filled:
      return <Button.Filled {...defaultProps} {...props} />;
    default:
      throw new Error("Invalid mode");
  }
};

const setup = (props?: Partial<ButtonProps & { mode: ButtonMode }>) =>
  render(renderComponent({ mode: ButtonMode.Filled, ...props }));

export { setup, defaultProps };
