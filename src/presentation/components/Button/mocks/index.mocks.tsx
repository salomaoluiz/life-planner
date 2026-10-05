import { render } from "@tests";

import { Button, ButtonProps } from "@components";

const defaultProps = {
  label: "Button Label",
  onPress: jest.fn(),
  testID: "default-button",
};

type Variant = "Destructive" | "Ghost" | "Primary" | "Secondary";

function setup(props?: Partial<ButtonProps> & { variant?: Variant }) {
  const Component = Button[props?.variant ?? "Primary"];
  render(<Component {...defaultProps} {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultProps, setup };
