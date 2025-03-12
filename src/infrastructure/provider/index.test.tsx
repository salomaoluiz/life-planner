import { screen, setup, spies } from "./mocks/index.mocks";

it("SHOULD render the provider", () => {
  setup();

  expect(screen.getByTestId("fetcher-provider")).toBeTruthy();
  expect(screen.getByTestId("infrastructure-children")).toBeTruthy();
});

it("SHOULD initialize GoogleOAuth", () => {
  setup();

  expect(spies.initializeGoogleOAuth).toHaveBeenCalledTimes(1);
});
