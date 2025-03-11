import * as applicationProviders from "@application/providers";
import * as presentationProviders from "@presentation/providers";
import * as infrastructureProvider from "@infrastructure/provider";

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
  .spyOn(infrastructureProvider, "default")
  .mockImplementation(({ children }) => (
    <View testID={"infrastructure-providers"}>{children}</View>
  ));

jest
  .spyOn(applicationProviders, "default")
  .mockImplementation(({ children }) => (
    <View testID={"application-providers"}>{children}</View>
  ));

jest
  .spyOn(loaderProvider, "LoaderProvider")
  .mockImplementation(({ children }) => (
    <View testID={"loader-provider"}>{children}</View>
  ));

const Children = () => <View testID={"children-element"} />;

const setup = () => render(<Children />, { wrapper: GlobalProviders });

it('SHOULD render "PresentationProviders", "ApplicationProviders" and "LoaderProvider"', () => {
  setup();

  expect(screen.getByTestId("presentation-providers")).toBeOnTheScreen();
  expect(screen.getByTestId("application-providers")).toBeOnTheScreen();
  expect(screen.getByTestId("infrastructure-providers")).toBeOnTheScreen();
  expect(screen.getByTestId("loader-provider")).toBeOnTheScreen();
  expect(screen.getByTestId("children-element")).toBeOnTheScreen();
  expect(screen.toJSON()).toMatchSnapshot();
});
