import { fireEvent, render, screen } from "@tests";

import IconTileButton from "./";

function setup(overrides = {}) {
  const onPress = jest.fn();

  render(
    <IconTileButton
      icon={"folder"}
      label={"Folder"}
      onPress={onPress}
      testID={"tile"}
      {...overrides}
    />,
  );

  return { onPress };
}

it("SHOULD show the label by default and report presses", () => {
  const { onPress } = setup();

  expect(screen.getByText("Folder")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("tile"));
  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the label in the plain variant but keep it as the accessibility label", () => {
  setup({ variant: "plain" });

  expect(screen.queryByText("Folder")).toBeNull();
  expect(screen.getByTestId("tile").props.accessibilityLabel).toBe("Folder");
});

it("SHOULD mark a selected tile as selected", () => {
  setup({ selected: true });

  expect(screen.getByTestId("tile").props.accessibilityState.selected).toBe(
    true,
  );
});
