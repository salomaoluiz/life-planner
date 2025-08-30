import React from "react";
import { render } from "@tests";

import DeleteFamily from "../";

// Mock react-native
jest.mock("react-native", () => ({
  View: ({ children, testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "container"} {...props}>
      {children}
    </MockedComponent>
  ),
}));

// Mock components
jest.mock("@components", () => ({
  Button: {
    Text: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "delete-family-button"} {...props} />
    ),
  },
}));

// Mock styles
jest.mock("../styles", () => () => ({
  styles: { container: {} },
  theme: { colors: { error: "error" } },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

interface Props {
  onPress: () => void;
}

const defaultProps: Props = {
  onPress: jest.fn(),
};

function setup(props?: Partial<Props>) {
  render(<DeleteFamily {...defaultProps} {...props} />);
}

export { defaultProps, setup };