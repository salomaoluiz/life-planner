import { NAVIGATION_ITEMS, SETTINGS_PATH } from "./navigationItems";

it("SHOULD list the 4 destinations in the spec order with their icons", () => {
  expect(
    NAVIGATION_ITEMS.map(({ icon, routeName }) => [routeName, icon]),
  ).toEqual([
    ["index/index", "home-outline"],
    ["financial", "wallet-outline"],
    ["stock/index", "package-variant-closed"],
    ["family/index", "account-group-outline"],
  ]);
});

it("SHOULD use the navigation.tabs translation keys AND unique testIDs", () => {
  expect(NAVIGATION_ITEMS.map((item) => item.labelKey)).toEqual([
    "navigation.tabs.home",
    "navigation.tabs.finances",
    "navigation.tabs.stock",
    "navigation.tabs.family",
  ]);
  expect(new Set(NAVIGATION_ITEMS.map((item) => item.testID)).size).toBe(4);
});

it("SHOULD expose the path the settings entry navigates to", () => {
  expect(SETTINGS_PATH).toBe("/settings");
});

it("SHOULD give only the Finances item its 6 section children", () => {
  const withChildren = NAVIGATION_ITEMS.filter((item) => item.children);

  expect(withChildren.map((item) => item.routeName)).toEqual(["financial"]);
  expect(withChildren[0].children?.map((child) => child.testID)).toEqual([
    "navigation-rail-financial-overview",
    "navigation-rail-financial-transactions",
    "navigation-rail-financial-categories",
    "navigation-rail-financial-tags",
    "navigation-rail-financial-accounts",
    "navigation-rail-financial-cards",
  ]);
});
