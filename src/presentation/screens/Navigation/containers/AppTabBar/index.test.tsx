import { fireEvent, screen } from "@tests";

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
  expect(spies.push).toHaveBeenLastCalledWith("/quick_add");

  screen.unmount();
  setBreakpoint("expanded");
  setup();
  fireEvent.press(screen.getByTestId("navigation-rail-add"));
  expect(spies.push).toHaveBeenLastCalledWith("/quick_add");
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
