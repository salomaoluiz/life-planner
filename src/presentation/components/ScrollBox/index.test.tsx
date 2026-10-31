import { StyleSheet, Text } from "react-native";

import { render, screen } from "@tests";

import ScrollBox from "./";

it("SHOULD cap the height, scroll nested and label the list", () => {
  render(
    <ScrollBox accessibilityLabel="Upcoming list" maxHeight={320} testID="box">
      <Text>row</Text>
    </ScrollBox>,
  );

  const box = screen.getByTestId("box");

  expect(StyleSheet.flatten(box.props.style).maxHeight).toBe(320);
  expect(box.props.nestedScrollEnabled).toBe(true);
  expect(box.props.accessibilityLabel).toBe("Upcoming list");
  expect(screen.getByText("row")).toBeTruthy();
});
