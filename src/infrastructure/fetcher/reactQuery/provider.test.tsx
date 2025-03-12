import { screen, setup, spies } from "./mocks/provider.mocks";

it("SHOULD render correctly", () => {
  setup();

  const clientProvider = screen.getByTestId("query-client-provider");
  expect(clientProvider).toBeTruthy();
  expect(clientProvider.props.client).toBeInstanceOf(spies.QueryClient);
  expect(screen.getByTestId("react-query-children")).toBeTruthy();
});
