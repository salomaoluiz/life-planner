import * as i18n from "@presentation/i18n";
import { View } from "react-native";
import { render, screen } from "@tests";
import PresentationProviders from "./";

jest
  .spyOn(i18n, "I18NProvider")
  .mockImplementation(({ children }) => (
    <View testID={"i18n-provider"}>{children}</View>
  ));

const Children = () => <View testID={"presentation-provider-children"}></View>;

const setup = () =>
  render(
    <PresentationProviders>
      <Children />
    </PresentationProviders>,
  );

it("SHOULD render the Providers", () => {
  setup();

  expect(screen.getByTestId("i18n-provider")).toBeTruthy();
  expect(screen.getByTestId("presentation-provider-children")).toBeTruthy();
  expect(screen.toJSON()).toMatchSnapshot();
});
