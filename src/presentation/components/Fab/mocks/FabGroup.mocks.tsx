import React from "react";
import { View } from "react-native";
import { render } from "@tests";

import FabGroup, { FabGroupProps } from "../FabGroup";

// Mock react-native-paper
jest.mock("react-native-paper", () => ({
  FAB: {
    Group: ({ actions, icon, onStateChange, open, testID, visible }: any) => (
      <MockedComponent
        testID={testID}
        actions={actions}
        icon={icon}
        onStateChange={onStateChange}
        open={open}
        visible={visible}
      />
    ),
  },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

const defaultProps: FabGroupProps = {
  actions: [
    { icon: "account", onPress: jest.fn() },
    { icon: "cog", onPress: jest.fn() },
  ],
  children: <View />,
  icon: "menu",
  isOpen: false,
  onStateChange: jest.fn(),
  testID: "test-fab-group",
};

function setup(props?: Partial<FabGroupProps>) {
  render(<FabGroup {...defaultProps} {...props} />);
}

export { defaultProps, setup };