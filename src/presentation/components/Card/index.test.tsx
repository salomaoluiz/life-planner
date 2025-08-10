import React from "react";
import { View } from "react-native";

import { screen } from "@tests";

import { defaultProps, setup } from "./mocks";

it("SHOULD render the card with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props).toEqual({
    children: defaultProps.children,
    style: undefined,
    testID: defaultProps.testID,
  });
});

it("SHOULD render the card with custom styles", () => {
  const customStyles = { backgroundColor: "red", padding: 10 };
  setup({ customStyles });

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props.style).toEqual(customStyles);
});

it("SHOULD render the card with children", () => {
  const customChildren = <View testID="custom-child" />;
  setup({ children: customChildren });

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props.children).toEqual(customChildren);
});
