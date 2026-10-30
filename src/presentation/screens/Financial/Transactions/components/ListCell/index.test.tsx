import { StyleSheet } from "react-native";

import { render, screen } from "@tests";

import ListCell from "./index";

it("SHOULD give earlier cells a higher zIndex AND keep the given style", () => {
  render(
    <>
      <ListCell index={0} style={{ top: 0 }} testID="first" />
      <ListCell index={3} style={{ top: 10 }} testID="later" />
    </>,
  );

  const first = StyleSheet.flatten(screen.getByTestId("first").props.style);
  const later = StyleSheet.flatten(screen.getByTestId("later").props.style);

  expect(first.zIndex).toBeGreaterThan(later.zIndex as number);
  expect(later.top).toBe(10);
});
