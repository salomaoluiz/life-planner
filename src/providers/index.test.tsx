import * as presentationProviders from "@presentation/providers";
import * as loaderProvider from "./loader";
import { View } from "react-native";
import { render, screen } from "@tests";
import GlobalProviders from "./";

jest
  .spyOn(presentationProviders, "default")
  .mockImplementation(({ children }) => (
    <View testID={"presentation-providers"}>{children}</View>
  ));

jest
  .spyOn(loaderProvider, "LoaderProvider")
  .mockImplementation(({ children }) => (
    <View testID={"loader-provider"}>{children}</View>
  ));

const Children = () => <View testID={"children-element"} />;

const setup = () =>
  render(
    <GlobalProviders>
      <Children />
    </GlobalProviders>,
  );

it('SHOULD render "PresentationProviders" and "LoaderProvider"', () => {
  setup();

  expect(screen.getByTestId("presentation-providers")).toBeOnTheScreen();
  expect(screen.getByTestId("loader-provider")).toBeOnTheScreen();
  expect(screen.getByTestId("children-element")).toBeOnTheScreen();
  expect(screen.toJSON()).toMatchSnapshot();
});
