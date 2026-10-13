import { fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD show the message and the action", () => {
  setup();

  expect(screen.getByText("No accounts yet.")).toBeOnTheScreen();
  expect(screen.getByText("Create account")).toBeOnTheScreen();
});

it("SHOULD call onCreate WHEN the action is pressed", () => {
  const { onCreate } = setup();

  fireEvent.press(screen.getByText("Create account"));

  expect(onCreate).toHaveBeenCalledTimes(1);
});
