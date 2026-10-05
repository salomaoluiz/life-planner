import { StyleSheet, Text } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { Card } from "@components";
import { lightTheme } from "@presentation/theme/provider";

it("SHOULD render children on a bordered surface with radius lg and no shadow", () => {
  render(
    <Card testID="card">
      <Text>child</Text>
    </Card>,
  );
  const style = StyleSheet.flatten(screen.getByTestId("card").props.style);

  expect(screen.getByText("child")).toBeTruthy();
  expect(style).toEqual(
    expect.objectContaining({
      backgroundColor: lightTheme.colors.surface,
      borderColor: lightTheme.colors.border,
      borderRadius: lightTheme.sizes.borderRadius.lg,
      borderWidth: 1,
      padding: lightTheme.sizes.spacing.md,
    }),
  );
  expect(style.shadowColor).toBeUndefined();
  expect(style.elevation).toBeUndefined();
});

it.each([
  ["sm", "sm"],
  ["md", "md"],
  ["lg", "lg"],
] as const)("SHOULD pad %s", (padding, token) => {
  render(
    <Card padding={padding} testID="card">
      <Text>x</Text>
    </Card>,
  );
  expect(
    StyleSheet.flatten(screen.getByTestId("card").props.style).padding,
  ).toBe(lightTheme.sizes.spacing[token]);
});

it("SHOULD dash the border WHEN variant is dashed", () => {
  render(
    <Card testID="card" variant="dashed">
      <Text>x</Text>
    </Card>,
  );
  expect(
    StyleSheet.flatten(screen.getByTestId("card").props.style).borderStyle,
  ).toBe("dashed");
});

it("SHOULD become a button WHEN onPress is given", () => {
  const onPress = jest.fn();

  render(
    <Card accessibilityLabel="Open" onPress={onPress} testID="card">
      <Text>x</Text>
    </Card>,
  );
  fireEvent.press(screen.getByTestId("card"));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("card").props.accessibilityRole).toBe("button");
});

it("SHOULD still accept the legacy customStyles", () => {
  render(
    <Card customStyles={{ marginTop: 7 }} testID="card">
      <Text>x</Text>
    </Card>,
  );
  expect(
    StyleSheet.flatten(screen.getByTestId("card").props.style).marginTop,
  ).toBe(7);
});
