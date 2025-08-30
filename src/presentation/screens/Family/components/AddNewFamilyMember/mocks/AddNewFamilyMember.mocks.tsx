import React from "react";
import { render } from "@tests";

import AddNewFamilyMember from "../";

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
    Filled: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "add-family-member-button"} {...props} />
    ),
  },
}));

// Mock styles
jest.mock("../styles", () => () => ({
  container: {},
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
  render(<AddNewFamilyMember {...defaultProps} {...props} />);
}

export { defaultProps, setup };