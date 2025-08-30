import { screen } from "@tests";

import { setup } from "./mocks/ItemSeparator.mocks";

it("SHOULD render ItemSeparator with container style", () => {
  setup();

  expect(screen.getByTestId("item-separator")).toBeDefined();
});