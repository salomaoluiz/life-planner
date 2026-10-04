import { BlurView } from "expo-blur";
import React from "react";
import { View } from "react-native";

import { mockDarkTheme, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the card with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props).toEqual({
    children: defaultProps.children,
    style: expect.any(Object),
    testID: defaultProps.testID,
  });
});

it("SHOULD render the card with custom styles", () => {
  const customStyles = { backgroundColor: "red", padding: 10 };
  setup({ customStyles });

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props.style).toContainEqual(
    expect.objectContaining(customStyles),
  );
});

it("SHOULD render the card with children", () => {
  const customChildren = <View testID="custom-child" />;
  setup({ children: customChildren });

  const component = screen.getByTestId(defaultProps.testID!);

  expect(component.props.children).toEqual(customChildren);
});

describe("theme", () => {
  it("SHOULD use the light blur settings WHEN the theme is light", () => {
    setup();

    expect(screen.UNSAFE_getByType(BlurView).props).toMatchObject({
      intensity: 40,
      tint: "light",
    });
  });

  it("SHOULD use the dark blur settings WHEN the theme is dark", () => {
    const restore = mockDarkTheme();

    setup();

    expect(screen.UNSAFE_getByType(BlurView).props).toMatchObject({
      intensity: 20,
      tint: "dark",
    });
    restore();
  });
});
