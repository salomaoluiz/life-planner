import * as i18n from "@presentation/i18n";
import * as theme from "@presentation/theme/provider";
import { View } from "react-native";
import { render, screen } from "@tests";
import PresentationProviders from "./";

jest
  .spyOn(i18n, "I18NProvider")
  .mockImplementation(({ children }) => (
    <View testID={"i18n-provider"}>{children}</View>
  ));
jest
  .spyOn(theme, "ThemeProvider")
  .mockImplementation(({ children }) => (
    <View testID={"theme-provider"}>{children}</View>
  ));

function Children() {
  return <View testID={"presentation-provider-children"}></View>;
}

function setup() {
  render(
    <PresentationProviders>
      <Children />
    </PresentationProviders>,
  );
}

it("SHOULD render the Providers", () => {
  setup();

  expect(screen.getByTestId("i18n-provider")).toBeTruthy();
  expect(screen.getByTestId("theme-provider")).toBeTruthy();
  expect(screen.getByTestId("presentation-provider-children")).toBeTruthy();
  expect(screen.toJSON()).toMatchSnapshot();
});
