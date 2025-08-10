import React from "react";
import { View } from "react-native";

import { render } from "@tests";

import { Fab, FabGroup, FabGroupProps, FabProps } from "@components";

const defaultFabProps: FabProps = {
  icon: "plus",
  onPress: jest.fn(),
  testID: "default-fab",
};

const defaultFabGroupProps: FabGroupProps = {
  actions: [
    { icon: "pencil", onPress: jest.fn() },
    { icon: "delete", onPress: jest.fn() },
  ],
  children: <View />,
  icon: "menu",
  isOpen: false,
  onStateChange: jest.fn(),
  testID: "default-fab-group",
};

function setupFab(props?: Partial<FabProps>) {
  render(<Fab {...defaultFabProps} {...props} />);
}

function setupFabGroup(props?: Partial<FabGroupProps>) {
  render(<FabGroup {...defaultFabGroupProps} {...props} />);
}

export { defaultFabGroupProps, defaultFabProps, setupFab, setupFabGroup };
