import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD show the message as a status", () => {
  setup();

  expect(
    screen.getByText("Archived family. Its data is read-only."),
  ).toBeTruthy();
  expect(screen.getByTestId("notice").props.role).toBe("status");
});
