import { fireEvent, screen } from "@tests";

import type { NavigationRailProps } from "./";
import { mocks, setup } from "./mocks/index.mocks";

it("SHOULD render the app name AND 4 tab rows", () => {
  setup();

  expect(screen.getByText("Life Planner")).toBeOnTheScreen();
  expect(screen.getAllByRole("tab")).toHaveLength(4);
});

it("SHOULD call onAddPress WHEN the add button is pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("navigation-rail-add"));

  expect(mocks.defaultProps.onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD mark only the active row as selected", () => {
  setup({ activeRouteName: "financial" });

  expect(
    screen.getByTestId("tab-finances").props.accessibilityState,
  ).toMatchObject({ selected: true });
  expect(screen.getByTestId("tab-home").props.accessibilityState).toMatchObject(
    { selected: false },
  );
});

it("SHOULD call onTabPress with the route name WHEN a row is pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("tab-finances"));

  expect(mocks.defaultProps.onTabPress).toHaveBeenCalledWith("financial");
});

it("SHOULD expose the profile entry with its label AND call onProfilePress", () => {
  setup();

  const profile = screen.getByTestId("navigation-rail-profile");
  expect(profile.props.accessibilityLabel).toBe("Profile");
  fireEvent.press(profile);

  expect(mocks.defaultProps.onProfilePress).toHaveBeenCalledTimes(1);
});

describe("WHEN an item has children", () => {
  function setupWithChildren(props?: Partial<NavigationRailProps>) {
    setup({
      items: mocks.items.map((item) =>
        item.routeName === "financial"
          ? { ...item, children: mocks.financeChildren }
          : item,
      ),
      ...props,
    });
  }

  it("SHOULD show the children AND the selected one WHEN its route is active", () => {
    setupWithChildren({
      activeChildPath: "/financial/categories",
      activeRouteName: "financial",
    });

    expect(
      screen.getByTestId("tab-finances").props.accessibilityState,
    ).toMatchObject({ expanded: true });
    expect(
      screen.getByTestId("navigation-rail-financial-categories").props
        .accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      screen.getByTestId("navigation-rail-financial-transactions").props
        .accessibilityState,
    ).toMatchObject({ selected: false });
  });

  it("SHOULD hide the children AND report collapsed WHEN another route is active", () => {
    setupWithChildren({ activeRouteName: "stock/index" });

    expect(
      screen.getByTestId("tab-finances").props.accessibilityState,
    ).toMatchObject({ expanded: false });
    expect(
      screen.queryByTestId("navigation-rail-financial-transactions"),
    ).toBeNull();
  });

  it("SHOULD call onChildPress with the child path WHEN a child is pressed", () => {
    const onChildPress = jest.fn();
    setupWithChildren({ activeRouteName: "financial", onChildPress });

    fireEvent.press(screen.getByTestId("navigation-rail-financial-categories"));

    expect(onChildPress).toHaveBeenCalledWith("/financial/categories");
  });
});
