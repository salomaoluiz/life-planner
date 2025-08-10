import React from "react";
import { View } from "react-native";
import { render } from "@tests";

import { Card, CardProps } from "@components";

const defaultProps: CardProps = {
  children: <View />,
  testID: "default-card",
};

function setup(props?: Partial<CardProps>) {
  render(<Card {...defaultProps} {...props} />);
}

export { defaultProps, setup };