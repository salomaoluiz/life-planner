import { fireEvent, screen } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { setBreakpoint, setup, spies } from "./mocks/index.mocks";

it.each(["compact", "medium"] as const)(
  "SHOULD render the bottom bar and no rail on %s",
  (breakpoint) => {
    setBreakpoint(breakpoint);
    setup();

    expect(screen.getByTestId("tab-bar")).toBeOnTheScreen();
    expect(screen.queryByTestId("navigation-rail")).toBeNull();
  },
);

it("SHOULD render the rail and no bottom bar WHEN the breakpoint is expanded", () => {
  setBreakpoint("expanded");
  setup();

  expect(screen.getByTestId("navigation-rail")).toBeOnTheScreen();
  expect(screen.queryByTestId("tab-bar")).toBeNull();
});

it("SHOULD emit tabPress AND navigate WHEN an inactive tab is pressed", () => {
  setup(0);

  fireEvent.press(screen.getByTestId("tab-stock"));

  expect(spies.emit).toHaveBeenCalledWith({
    canPreventDefault: true,
    target: "stock-key",
    type: "tabPress",
  });
  expect(spies.dispatch).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT navigate WHEN the pressed tab is already active", () => {
  setup(2); // stock

  fireEvent.press(screen.getByTestId("tab-stock"));

  expect(spies.dispatch).not.toHaveBeenCalled();
});

it("SHOULD NOT navigate WHEN tabPress is default-prevented", () => {
  spies.emit.mockReturnValueOnce({ defaultPrevented: true });
  setup(0);

  fireEvent.press(screen.getByTestId("tab-family"));

  expect(spies.dispatch).not.toHaveBeenCalled();
});

it("SHOULD open the quick-add modal from the + button AND from the rail Add button", () => {
  setup();
  fireEvent.press(screen.getByTestId("quick-add-button"));
  expect(modalNavigation.openModal).toHaveBeenLastCalledWith("quick_add");

  screen.unmount();
  setBreakpoint("expanded");
  setup();
  fireEvent.press(screen.getByTestId("navigation-rail-add"));
  expect(modalNavigation.openModal).toHaveBeenLastCalledWith("quick_add");
});

it("SHOULD open /settings from the rail profile entry", () => {
  setBreakpoint("expanded");
  setup();

  fireEvent.press(screen.getByTestId("navigation-rail-profile"));

  expect(spies.push).toHaveBeenCalledWith("/settings");
});

it("SHOULD mark the focused route as the selected tab", () => {
  setup(1);

  expect(
    screen.getByTestId("tab-finances").props.accessibilityState,
  ).toMatchObject({ selected: true });
});

it.each(["compact", "expanded"] as const)(
  "SHOULD render the bar with no active item WHEN the hidden settings route is focused on %s",
  (breakpoint) => {
    setBreakpoint(breakpoint);
    setup(4);

    expect(
      screen.getByTestId(
        breakpoint === "expanded" ? "navigation-rail" : "tab-bar",
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId("tab-home").props.accessibilityState.selected,
    ).toBe(false);
  },
);

describe("WHEN the Finances tab is pressed", () => {
  it("SHOULD open Transactions on the rail even when already inside Finances", () => {
    setBreakpoint("expanded");
    setup(1, "/financial/cards");

    fireEvent.press(screen.getByTestId("tab-finances"));

    expect(spies.navigate).toHaveBeenCalledWith("/financial/transaction");
    expect(spies.dispatch).not.toHaveBeenCalled();
  });

  it("SHOULD open Transactions on the bottom bar WHEN coming from another tab", () => {
    setup(0);

    fireEvent.press(screen.getByTestId("tab-finances"));

    expect(spies.navigate).toHaveBeenCalledWith("/financial/transaction");
    expect(spies.push).not.toHaveBeenCalled();
  });

  it("SHOULD open the section picker WHEN Finances is already active on the bottom bar", () => {
    setup(1);

    fireEvent.press(screen.getByTestId("tab-finances"));

    expect(modalNavigation.openModal).toHaveBeenCalledWith("section_picker");
    expect(spies.navigate).not.toHaveBeenCalled();
  });
});

it("SHOULD highlight the section of the pathname AND replace the route WHEN a child is pressed", () => {
  setBreakpoint("expanded");
  setup(1, "/financial/accounts");

  expect(
    screen.getByTestId("navigation-rail-financial-accounts").props
      .accessibilityState,
  ).toMatchObject({ selected: true });

  fireEvent.press(screen.getByTestId("navigation-rail-financial-categories"));

  expect(spies.replace).toHaveBeenCalledWith("/financial/categories");
});

it("SHOULD hide the Finances children WHEN another tab is active", () => {
  setBreakpoint("expanded");
  setup(2);

  expect(
    screen.queryByTestId("navigation-rail-financial-categories"),
  ).toBeNull();
});
