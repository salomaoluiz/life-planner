import React from "react";
import { render } from "@tests";

import Fab, { FabProps } from "../Fab";

// Mock react-native-paper
jest.mock("react-native-paper", () => ({
  FAB: ({ icon, label, onPress, testID }: any) => (
    <MockedComponent
      testID={testID}
      icon={icon}
      label={label}
      onPress={onPress}
    />
  ),
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

const defaultProps: FabProps = {
  icon: "plus",
  onPress: jest.fn(),
  testID: "test-fab",
};

function setup(props?: Partial<FabProps>) {
  render(<Fab {...defaultProps} {...props} />);
}

export { defaultProps, setup };