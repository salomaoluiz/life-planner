import { StyleSheet, Text } from "react-native";

import { fireEvent, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { onActionPress, setup } from "./mocks/index.mocks";

it("SHOULD render the heading title and children", () => {
  setup();
  const title = screen.getByTestId("section-title");

  expect(title.props.children).toBe("Expiring");
  expect(StyleSheet.flatten(title.props.style).fontSize).toBe(
    lightTheme.typography.heading.fontSize,
  );
  expect(screen.getByText("child")).toBeTruthy();
});

it("SHOULD use the overline style WHEN variant is overline", () => {
  setup({ variant: "overline" });
  expect(
    StyleSheet.flatten(screen.getByTestId("section-title").props.style)
      .textTransform,
  ).toBe("uppercase");
});

it("SHOULD not render the action WHEN there is no label", () => {
  setup();
  expect(screen.queryByTestId("section-action")).toBeNull();
});

it("SHOULD render a ghost action and call it", () => {
  setup({ actionLabel: "See all", onActionPress });
  fireEvent.press(screen.getByTestId("section-action"));
  expect(onActionPress).toHaveBeenCalledTimes(1);
});

it("SHOULD drop the side padding of the action by default", () => {
  setup({ actionLabel: "See all", onActionPress });
  const inline = StyleSheet.flatten(
    screen.getByTestId("section-action").props.style,
  );

  expect(inline.paddingHorizontal).toBe(0);
});

it("SHOULD give the action side padding for its focus ring WHEN actionInset", () => {
  setup({ actionInset: true, actionLabel: "See all", onActionPress });
  const inset = StyleSheet.flatten(
    screen.getByTestId("section-action").props.style,
  );

  expect(inset.paddingHorizontal).toBeGreaterThan(0);
});

it("SHOULD render the leading action content before the action", () => {
  setup({
    actionLabel: "See all",
    actionLeading: <Text>leading</Text>,
    onActionPress,
  });

  expect(screen.getByText("leading")).toBeTruthy();
  expect(screen.getByText("See all")).toBeTruthy();
});
