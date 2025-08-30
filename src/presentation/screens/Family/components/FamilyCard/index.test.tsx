import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/FamilyCard.mocks";

it("SHOULD render FamilyCard accordion", () => {
  setup();

  expect(screen.getByTestId("accordion-container")).toBeDefined();
});