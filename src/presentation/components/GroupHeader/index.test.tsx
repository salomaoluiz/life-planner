import { fireEvent, screen } from "@testing-library/react-native";
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

describe("interactive header (spec 035)", () => {
  it("SHOULD render the meta next to the title", () => {
    setup({ meta: <Text testID="meta">net</Text> });

    expect(screen.getByTestId("meta")).toBeTruthy();
  });

  it("SHOULD become a button that calls onPress AND exposes the expanded state", () => {
    const onPress = jest.fn();
    setup({ accessibilityLabel: "Balance", expanded: true, onPress });

    const header = screen.getByTestId("group-header");

    expect(header.props.accessibilityRole).toBe("button");
    expect(header.props.accessibilityState.expanded).toBe(true);

    fireEvent.press(header);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
