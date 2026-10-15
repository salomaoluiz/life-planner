import { StyleSheet } from "react-native";

import { render, screen } from "@tests";

import Divider from "./";

it("SHOULD render a 1 px border line", () => {
  render(<Divider testID="divider" />);
  expect(StyleSheet.flatten(screen.getByTestId("divider").props.style)).toEqual(
    expect.objectContaining({ height: 1, marginLeft: 0 }),
  );
});

it("SHOULD inset 52 px WHEN inset", () => {
  render(<Divider inset testID="divider" />);
  expect(
    StyleSheet.flatten(screen.getByTestId("divider").props.style).marginLeft,
  ).toBe(52);
});

it("SHOULD render a full-height 1 px column line WHEN vertical", () => {
  render(<Divider testID="divider" vertical />);
  expect(StyleSheet.flatten(screen.getByTestId("divider").props.style)).toEqual(
    expect.objectContaining({ alignSelf: "stretch", width: 1 }),
  );
});
