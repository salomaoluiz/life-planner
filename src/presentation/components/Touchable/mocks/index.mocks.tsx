import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { render, screen } from "@tests";

import Touchable from "../";

const defaultProps = {
  accessibilityLabel: "Do it",
  accessibilityRole: "button" as const,
  onPress: jest.fn(),
  testID: "touchable",
};

function flatStyle(element: { props: { style?: unknown } }): ViewStyle {
  return StyleSheet.flatten(element.props.style as StyleProp<ViewStyle>) ?? {};
}

function setup(props?: Partial<React.ComponentProps<typeof Touchable>>) {
  render(
    <Touchable {...defaultProps} {...props}>
      {null}
    </Touchable>,
  );
  return screen.getByTestId(defaultProps.testID);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultProps, flatStyle, setup };
