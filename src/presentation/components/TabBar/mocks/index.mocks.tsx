import { render } from "@tests";

import TabBar from "../";
import { TabBarItem, TabBarProps } from "../types";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ bottom: 0, left: 0, right: 0, top: 0 })),
}));

// region mocks
const items: TabBarItem[] = [
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

const defaultProps: TabBarProps = {
  activeRouteName: "index/index",
  items,
  onQuickAddPress: jest.fn(),
  onTabPress: jest.fn(),
  quickAddLabel: "Add",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<TabBarProps>) {
  render(<TabBar {...defaultProps} {...props} />);
}

const mocks = { defaultProps, items };

export { mocks, setup };
