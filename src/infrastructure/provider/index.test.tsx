import { screen, setup } from "./mocks/index.mocks";

it("SHOULD render the provider", () => {
  setup();

  expect(screen.getByTestId("fetcher-provider")).toBeTruthy();
  expect(screen.getByTestId("infrastructure-children")).toBeTruthy();
});
