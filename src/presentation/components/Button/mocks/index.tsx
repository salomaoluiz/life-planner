import { render } from "@tests";

import { Button, ButtonProps } from "@components";
import { ButtonMode } from "@components/Button";

const defaultProps = {
  label: "Button Label",
  onPress: jest.fn(),
  testID: "default-button",
};

function renderComponent(props?: Partial<ButtonProps & { mode: ButtonMode }>) {
  switch (props?.mode) {
    case ButtonMode.Filled:
      return <Button.Filled {...defaultProps} {...props} />;
    case ButtonMode.Outlined:
      return <Button.Outlined {...defaultProps} {...props} />;
    case ButtonMode.Text:
      return <Button.Text {...defaultProps} {...props} />;
    default:
      throw new Error("Invalid mode");
  }
}

function setup(props?: Partial<ButtonProps & { mode: ButtonMode }>) {
  render(renderComponent({ mode: ButtonMode.Filled, ...props }));
}

export { defaultProps, setup };
