import { render } from "@tests";

import Spacer, { SpacerProps } from "../index";

const defaultProps: SpacerProps = {
  direction: "both",
  size: "medium",
  testID: "test-spacer",
};

function setup(props?: Partial<SpacerProps>) {
  const finalProps = { ...defaultProps, ...props };
  render(<Spacer {...finalProps} />);
}

export { defaultProps, setup };