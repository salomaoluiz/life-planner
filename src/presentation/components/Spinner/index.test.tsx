import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render a labelled activity indicator", () => {
  setup();
  expect(screen.getByTestId("spinner")).toBeTruthy();
  expect(screen.getByLabelText("Updating")).toBeTruthy();
});
