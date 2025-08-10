import { render } from "@tests";

import { HelperText, HelperTextProps } from "@components";

const defaultProps: HelperTextProps = {
  label: "Helper text message",
  testID: "default-helper-text",
  type: "info",
  visible: true,
};

function setup(props?: Partial<HelperTextProps>) {
  render(<HelperText {...defaultProps} {...props} />);
}

export { defaultProps, setup };
