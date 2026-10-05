import { render } from "@tests";

import NavigationRail, { NavigationRailProps } from "../";

// region mocks
const items = [
  {
    icon: "home-outline",
    label: "Home",
    routeName: "index/index",
    testID: "tab-home",
  },
  {
    icon: "wallet-outline",
    label: "Finances",
    routeName: "financial",
    testID: "tab-finances",
  },
  {
    icon: "package-variant-closed",
    label: "Stock",
    routeName: "stock/index",
    testID: "tab-stock",
  },
  {
    icon: "account-group-outline",
    label: "Family",
    routeName: "family/index",
    testID: "tab-family",
  },
];

const defaultProps: NavigationRailProps = {
  activeRouteName: "index/index",
  addLabel: "Add",
  appName: "Life Planner",
  items,
  onAddPress: jest.fn(),
  onProfilePress: jest.fn(),
  onTabPress: jest.fn(),
  profileLabel: "Profile",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<NavigationRailProps>) {
  render(<NavigationRail {...defaultProps} {...props} />);
}

const mocks = { defaultProps, items };

export { mocks, setup };
