import * as reactNative from "react-native";

import { QueryStatus } from "@infrastructure/fetcher/types";

import { mocks, screen, setup, spies } from "./mocks/provider.mocks";

it("SHOULD render the theme provider", () => {
  setup();

  expect(screen.getByTestId("paper-theme-provider")).toBeOnTheScreen();
  expect(screen.getByTestId("default-children")).toBeOnTheScreen();
});

it("SHOULD call all hooks correctly", () => {
  setup();

  expect(spies.useProviderLoader).toHaveBeenCalledTimes(1);
  expect(spies.useQuery).toHaveBeenCalledTimes(1);
  expect(spies.useQuery).toHaveBeenCalledWith({
    cacheKey: [mocks.useCases.getUserConfigsUseCase.uniqueName],
    fetch: mocks.useCases.getUserConfigsUseCase.execute,
  });
  expect(spies.useMutation).toHaveBeenCalledTimes(1);
  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: [mocks.useCases.saveUserConfigsUseCase.uniqueName],
    fetch: mocks.useCases.saveUserConfigsUseCase.execute,
  });
  expect(spies.useColorScheme).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT keep the provider loading the theme while the query not respond", () => {
  setup();

  expect(spies.setBarStyle).not.toHaveBeenCalled();
  expect(spies.setBackgroundColor).not.toHaveBeenCalled();
  expect(spies.setHidden).toHaveBeenCalledTimes(1);
  expect(spies.setHidden).toHaveBeenCalledWith(true);
  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledTimes(1);
  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledWith(
    true,
    "theme",
  );
});

it.each(["error", "not_mapped" as never] as QueryStatus[])(
  'SHOULD use the default theme on query "%s" status',
  (status) => {
    spies.useQuery.mockReturnValueOnce({
      ...mocks.useQuery.fixture.build(),
      status,
    });

    setup();

    expect(spies.setBarStyle).toHaveBeenCalledTimes(1);
    expect(spies.setBarStyle).toHaveBeenCalledWith("dark-content");
    expect(spies.setBackgroundColor).toHaveBeenCalledTimes(1);
    expect(spies.setBackgroundColor).toHaveBeenCalledWith(
      mocks.colors.light.background,
    );
    expect(spies.setHidden).toHaveBeenCalledTimes(2);
    expect(spies.setHidden).toHaveBeenLastCalledWith(false);
    expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledTimes(1);
    expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledWith(
      false,
      "theme",
    );
  },
);

it("SHOULD capture a message in case of a unknown status", () => {
  spies.useQuery.mockReturnValueOnce({
    ...mocks.useQuery.fixture.build(),
    status: "not_mapped" as never,
  });

  setup();

  expect(spies.captureMessage).toHaveBeenCalledTimes(1);
  expect(spies.captureMessage).toHaveBeenCalledWith(
    "Invalid useQuery status on ThemeProvider",
    {
      action: "Using the default theme",
      status: "not_mapped",
    },
  );
});

it("SHOULD update the StatusBar to the user theme ", () => {
  spies.useQuery
    .mockReturnValueOnce(mocks.useQuery.darkMode)
    .mockReturnValueOnce(mocks.useQuery.darkMode);

  setup();

  expect(spies.setBarStyle).toHaveBeenCalledTimes(1);
  expect(spies.setBarStyle).toHaveBeenCalledWith("light-content");
  expect(spies.setBackgroundColor).toHaveBeenCalledTimes(1);
  expect(spies.setBackgroundColor).toHaveBeenCalledWith(
    mocks.colors.dark.background,
  );
  expect(spies.setHidden).toHaveBeenCalledTimes(2);
  expect(spies.setHidden).toHaveBeenLastCalledWith(false);
  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledTimes(1);
  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenLastCalledWith(
    false,
    "theme",
  );
});

it('SHOULD set the theme to "light" WHEN the device color schema is "light"', () => {
  setup();

  const theme = screen.getByTestId("paper-theme-provider").props.theme.colors;

  expect(theme).toEqual(mocks.colors.light);
});

it('SHOULD set the theme to "dark" WHEN the device color schema is "dark"', () => {
  jest.spyOn(reactNative, "useColorScheme").mockReturnValueOnce("dark");

  setup();

  const theme = screen.getByTestId("paper-theme-provider").props.theme.colors;

  expect(theme).toEqual(mocks.colors.dark);
});
