import { setup, screen } from "./mocks/provider.mocks";

it("SHOULD render correctly", () => {
  setup();

  expect(screen.getByTestId("react-query-provider")).toBeTruthy();
  expect(screen.getByTestId("react-query-children")).toBeTruthy();
});
