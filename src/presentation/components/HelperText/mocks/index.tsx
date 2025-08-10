import { render } from "@tests";

import { HelperText, HelperTextProps } from "@components";

const defaultProps: HelperTextProps = {
  label: "Helper text message",
  type: "info",
  visible: true,
  testID: "default-helper-text",
};

function setup(props?: Partial<HelperTextProps>) {
  render(<HelperText {...defaultProps} {...props} />);
}

export { defaultProps, setup };