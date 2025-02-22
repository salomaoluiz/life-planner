import { screen } from "@tests";

import * as reactNative from "react-native";
import { setup, providerLoaderResult } from "./mocks/provider";

import { colors } from "./constants";

it("SHOULD render the theme provider", () => {
  setup();

  expect(screen.getByTestId("paper-theme-provider")).toBeOnTheScreen();
  expect(screen.getByTestId("default-children")).toBeOnTheScreen();
});

it("SHOULD set the loading state when loaded", () => {
  setup();

  expect(providerLoaderResult.setIsLoading).toHaveBeenCalledWith(
    false,
    "theme",
  );
});

it('SHOULD set the theme to "light" WHEN the color schema is "light"', () => {
  setup();

  const theme = screen.getByTestId("paper-theme-provider").props.theme.colors;

  expect(theme).toEqual(colors.light);
});

it('SHOULD set the theme to "dark" WHEN the color schema is "dark"', () => {
  jest.spyOn(reactNative, "useColorScheme").mockReturnValue("dark");

  setup();

  const theme = screen.getByTestId("paper-theme-provider").props.theme.colors;

  expect(theme).toEqual(colors.dark);
});
