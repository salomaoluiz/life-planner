import { fireEvent, render } from "@tests";

import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";

import {
  mocks,
  renderComponent,
  screen,
  setup,
  spies,
} from "./mocks/provider.mocks";

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
  expect(spies.useColorScheme).toHaveBeenCalled();
});

it("SHOULD resolve SYSTEM with the OS scheme (dark)", () => {
  spies.useColorScheme.mockReturnValue("dark");
  spies.useQuery.mockReturnValue(mocks.useQuery.system);
  setup();
  expect(screen.getByTestId("probe").props.accessibilityLabel).toBe(
    "SYSTEM|true",
  );
});

it("SHOULD follow a live OS change WHEN the mode is SYSTEM", () => {
  spies.useColorScheme.mockReturnValue("light");
  spies.useQuery.mockReturnValue(mocks.useQuery.system);
  const { rerender } = render(renderComponent());
  expect(screen.getByTestId("probe").props.accessibilityLabel).toBe(
    "SYSTEM|false",
  );

  spies.useColorScheme.mockReturnValue("dark");
  rerender(renderComponent());

  expect(screen.getByTestId("probe").props.accessibilityLabel).toBe(
    "SYSTEM|true",
  );
});

it.each([
  [mocks.useQuery.light, "dark", "LIGHT|false"],
  [mocks.useQuery.dark, "light", "DARK|true"],
])("SHOULD keep the stored mode over the OS scheme", (query, scheme, label) => {
  spies.useColorScheme.mockReturnValue(scheme as "dark" | "light");
  spies.useQuery.mockReturnValue(query);
  setup();
  expect(screen.getByTestId("probe").props.accessibilityLabel).toBe(label);
});

it("SHOULD use the system theme AND release the loader WHEN the config query fails", () => {
  spies.useColorScheme.mockReturnValue("dark");
  spies.useQuery.mockReturnValue(mocks.useQuery.error);
  setup();
  expect(screen.getByTestId("probe").props.accessibilityLabel).toBe(
    "SYSTEM|true",
  );
  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledWith(
    false,
    "theme",
  );
});

it("SHOULD keep the loader on while the query is pending", () => {
  spies.useQuery.mockReturnValue(mocks.useQuery.pending);
  setup();
  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledWith(
    true,
    "theme",
  );
});

it("SHOULD capture a message in case of a unknown status", () => {
  spies.useQuery.mockReturnValue({
    ...mocks.useQuery.fixture.build(),
    status: "not_mapped" as never,
  });

  setup();

  expect(spies.captureMessage).toHaveBeenCalledWith(
    "Invalid useQuery status on ThemeProvider",
    {
      action: "Using the system theme",
      status: "not_mapped",
    },
  );
});

it("SHOULD persist only themeMode AND not remount children WHEN the user changes the mode", () => {
  spies.useQuery.mockReturnValue(mocks.useQuery.system);
  const mutate = jest.fn();
  spies.useMutation.mockReturnValue({ ...mocks.useMutation, mutate });
  setup();
  expect(mocks.mountCounter).toHaveBeenCalledTimes(1);

  fireEvent(screen.getByTestId("probe"), "touchEnd");

  expect(mutate).toHaveBeenCalledWith({ themeMode: ThemeMode.LIGHT });
  expect(screen.getByTestId("probe").props.accessibilityLabel).toBe(
    "LIGHT|false",
  );
  expect(mocks.mountCounter).toHaveBeenCalledTimes(1);
});

it.each([
  ["dark", "light-content"],
  ["light", "dark-content"],
])("SHOULD style the status bar for %s", (scheme, barStyle) => {
  spies.useColorScheme.mockReturnValue(scheme as "dark" | "light");
  spies.useQuery.mockReturnValue(mocks.useQuery.system);
  setup();
  expect(spies.setBarStyle).toHaveBeenCalledWith(barStyle);
  expect(spies.setBackgroundColor).toHaveBeenCalledWith(
    mocks.colors[scheme as "dark" | "light"].background,
  );
});

it("SHOULD keep the loader on WHILE the fonts are not ready", () => {
  spies.useAppFonts.mockReturnValue({ failed: false, ready: false });
  spies.useQuery.mockReturnValue(mocks.useQuery.system);
  setup();

  expect(mocks.providerLoaderResponse.setIsLoading).not.toHaveBeenCalledWith(
    false,
    "theme",
  );
  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledWith(
    true,
    "theme",
  );
});

it("SHOULD release the loader AND render with the system font WHEN font loading failed", () => {
  spies.useAppFonts.mockReturnValue({ failed: true, ready: true });
  spies.useQuery.mockReturnValue(mocks.useQuery.system);
  setup();

  expect(mocks.providerLoaderResponse.setIsLoading).toHaveBeenCalledWith(
    false,
    "theme",
  );
  expect(screen.getByTestId("default-children")).toBeOnTheScreen();
});
