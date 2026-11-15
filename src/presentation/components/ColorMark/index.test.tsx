import { StyleSheet } from "react-native";

import { screen } from "@tests";

import { setup, setupBar } from "./mocks/index.mocks";

it("SHOULD paint the mark with the data color", () => {
  setup();

  expect(
    StyleSheet.flatten(screen.getByTestId("mark").props.style).backgroundColor,
  ).toBe("#4F5BD5");
});

it("SHOULD grow the mark WHEN a height and a width are given", () => {
  setup({ height: 32, width: 10 });

  const style = StyleSheet.flatten(screen.getByTestId("mark").props.style);

  expect(style.height).toBe(32);
  expect(style.width).toBe(10);
});

it("SHOULD clamp the share bar AND expose the percentage", () => {
  setupBar({ progress: 2 });

  expect(screen.getByTestId("share").props.accessibilityValue.now).toBe(100);
});

it("SHOULD fill half of the bar", () => {
  setupBar();

  const node = screen
    .getByTestId("share")
    .findAll((child) => child.props.style !== undefined)[1];

  expect(StyleSheet.flatten(node.props.style).width).toBe("50%");
});
