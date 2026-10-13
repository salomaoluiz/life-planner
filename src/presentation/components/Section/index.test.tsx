import { StyleSheet } from "react-native";

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
