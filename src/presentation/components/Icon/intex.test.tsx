import { StyleSheet } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { IconButton } from "@components/Icon";

import { mocks, setup } from "./mocks/index.mocks";

it("SHOULD render the icon with the correct props", () => {
  setup();

  const component = screen.getByTestId(mocks.defaultProps.testID);

  expect(component.props).toEqual({
    children: undefined,
    color: "black",
    size: 20,
    source: "google",
    testID: "default-icon",
  });
});

it("SHOULD render an IconButton with role, label and 44 px target and call onPress", () => {
  const onPress = jest.fn();
  render(
    <IconButton
      accessibilityLabel="Close"
      name="close"
      onPress={onPress}
      testID="icon-button"
    />,
  );
  const button = screen.getByTestId("icon-button");

  fireEvent.press(button);

  expect(onPress).toHaveBeenCalledTimes(1);
  expect(button.props.accessibilityLabel).toBe("Close");
  expect(button.props.accessibilityRole).toBe("button");
  expect(StyleSheet.flatten(button.props.style)).toEqual(
    expect.objectContaining({ borderWidth: 1, height: 44, width: 44 }),
  );
});

it("SHOULD drop fill and border WHEN plain", () => {
  render(
    <IconButton
      accessibilityLabel="Close"
      name="close"
      onPress={jest.fn()}
      testID="icon-button"
      variant="plain"
    />,
  );
  const style = StyleSheet.flatten(
    screen.getByTestId("icon-button").props.style,
  );

  expect(style.borderWidth).toBeUndefined();
  expect(style.backgroundColor).toBeUndefined();
});
