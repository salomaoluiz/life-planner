import { StyleSheet } from "react-native";

import { render, screen } from "@tests";

import { ColorDot } from "@components";

it("SHOULD draw a dot of the given colour AND hide itself from screen readers WHEN it has no label", () => {
  render(<ColorDot color="#4F5BD5" testID="dot" />);

  const dot = screen.getByTestId("dot", { includeHiddenElements: true });

  expect(StyleSheet.flatten(dot.props.style)).toMatchObject({
    backgroundColor: "#4F5BD5",
  });
  expect(dot.props.accessibilityElementsHidden).toBe(true);
});

it("SHOULD expose its label WHEN it carries one", () => {
  render(<ColorDot accessibilityLabel="Stocks" color="#4F5BD5" testID="dot" />);

  expect(
    screen.getByTestId("dot", { includeHiddenElements: true }).props
      .accessibilityLabel,
  ).toBe("Stocks");
  expect(
    screen.getByTestId("dot", { includeHiddenElements: true }).props
      .accessibilityElementsHidden,
  ).toBe(false);
});

it("SHOULD be taller than the default WHEN a size is given", () => {
  render(<ColorDot color="#111111" size={14} testID="dot" />);

  expect(
    StyleSheet.flatten(
      screen.getByTestId("dot", { includeHiddenElements: true }).props.style,
    ),
  ).toMatchObject({ height: 14, width: 14 });
});
