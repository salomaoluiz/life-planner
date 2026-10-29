import { fireEvent, screen } from "@tests";

import { mocks, setup } from "./mocks/index.mocks";

function flatStyle() {
  return Object.assign({}, ...[screen.getByTestId("fab").props.style].flat(2));
}

it("SHOULD render an accessible button with the label in both variants", () => {
  setup();
  expect(screen.getByLabelText("New")).toBeOnTheScreen();
  expect(screen.getByRole("button")).toBeOnTheScreen();
});

it("SHOULD call onPress WHEN pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("fab"));

  expect(mocks.defaultProps.onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD be an icon-only 56x56 button with radius 16 WHEN not extended", () => {
  setup();

  expect(flatStyle()).toMatchObject({
    borderRadius: 16,
    height: 56,
    width: 56,
  });
  expect(screen.queryByText("New")).toBeNull();
});

it("SHOULD be 56 tall and show the label WHEN extended", () => {
  setup({ extended: true });

  expect(flatStyle()).toMatchObject({ height: 56 });
  expect(screen.getByText("New")).toBeOnTheScreen();
});
