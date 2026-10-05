import { fireEvent, screen } from "@tests";

import { mocks, setup } from "./mocks/index.mocks";

it("SHOULD render an accessible button with the label", () => {
  setup();

  expect(screen.getByLabelText("Add")).toBeOnTheScreen();
  expect(screen.getByRole("button")).toBeOnTheScreen();
});

it("SHOULD call onPress WHEN pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("quick-add-button"));

  expect(mocks.defaultProps.onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD be 52x52 with the accent shadow", () => {
  setup();

  const flat = Object.assign(
    {},
    ...[screen.getByTestId("quick-add-button").props.style].flat(2),
  );
  expect(flat).toMatchObject({
    height: 52,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    width: 52,
  });
});
