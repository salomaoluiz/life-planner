import { fireEvent, screen } from "@tests";

import { mocks, setup } from "./mocks/index.mocks";

it("SHOULD render the 4 tabs AND the quick-add button between the 2nd and 3rd", () => {
  setup();

  const labels = screen
    .getAllByRole("tab")
    .map((tab) => tab.props.accessibilityLabel);
  expect(labels).toEqual(["Home", "Finances", "Stock", "Family"]);
  expect(screen.getByTestId("quick-add-button")).toBeOnTheScreen();
  const ids = screen
    .getAllByTestId(/^(tab-(?!bar)|quick-add-button)/)
    .map((node) => node.props.testID);
  expect(ids).toEqual([
    "tab-home",
    "tab-finances",
    "quick-add-button",
    "tab-stock",
    "tab-family",
  ]);
});

it("SHOULD mark only the active tab as selected", () => {
  setup({ activeRouteName: "stock/index" });

  expect(
    screen.getByTestId("tab-stock").props.accessibilityState,
  ).toMatchObject({ selected: true });
  expect(screen.getByTestId("tab-home").props.accessibilityState).toMatchObject(
    { selected: false },
  );
});

it("SHOULD call onTabPress with the route name WHEN a tab is pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("tab-finances"));

  expect(mocks.defaultProps.onTabPress).toHaveBeenCalledWith("financial");
});

it("SHOULD call onQuickAddPress WHEN the plus button is pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("quick-add-button"));

  expect(mocks.defaultProps.onQuickAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD add the bottom safe-area inset to the bar height", () => {
  const { useSafeAreaInsets } = jest.requireMock(
    "react-native-safe-area-context",
  );
  useSafeAreaInsets.mockReturnValueOnce({
    bottom: 34,
    left: 0,
    right: 0,
    top: 0,
  });

  setup();

  const flat = Object.assign(
    {},
    ...[screen.getByTestId("tab-bar").props.style].flat(),
  );
  expect(flat.height).toBeGreaterThan(34);
});
