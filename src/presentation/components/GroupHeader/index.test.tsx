import { screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { hasText } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render the title as a header", () => {
  setup();

  expect(screen.getByTestId("group-header").props.accessibilityRole).toBe(
    "header",
  );
  expect(hasText("Today")).toBe(true);
});

it("SHOULD render the trailing node", () => {
  setup({ trailing: <Text testID="net">net</Text> });

  expect(screen.getByTestId("net")).toBeTruthy();
});
