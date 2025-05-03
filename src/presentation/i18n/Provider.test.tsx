import { screen, setup } from "./mocks/Provider.mocks";

it("SHOULD render the react-i18n provider", () => {
  setup();

  expect(screen.getByTestId("react-i18n-provider")).toBeOnTheScreen();
  expect(screen.getByTestId("i18n-provider-children")).toBeOnTheScreen();
  expect(screen.toJSON()).toMatchSnapshot();
});
