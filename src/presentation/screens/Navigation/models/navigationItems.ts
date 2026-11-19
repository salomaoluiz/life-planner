import { TranslationKeys } from "@presentation/i18n/types";
import { FINANCIAL_SECTIONS } from "@screens/Financial/Layout/models/financialSections";
import { INVESTMENT_SECTIONS } from "@screens/Investment/Layout/models/investmentSections";
import { STOCK_SECTIONS } from "@screens/Stock/Layout/models/stockSections";

export interface NavigationChild {
  icon: string;
  labelKey: TranslationKeys;
  path: string;
  section: string;
  testID: string;
}

export interface NavigationItem {
  children?: NavigationChild[];
  icon: string;
  labelKey: TranslationKeys;
  routeName: TabRouteName;
  testID: string;
}

export type TabRouteName =
  | "family/index"
  | "financial"
  | "index/index"
  | "investments"
  | "stock";

export const SETTINGS_PATH = "/settings";

// Order matters: the bottom bar puts the quick-add button between the 2nd and 3rd item.
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    icon: "home-outline",
    labelKey: "navigation.tabs.home",
    routeName: "index/index",
    testID: "tab-home",
  },
  {
    children: FINANCIAL_SECTIONS.map((item) => ({ ...item })),
    icon: "wallet-outline",
    labelKey: "navigation.tabs.finances",
    routeName: "financial",
    testID: "tab-finances",
  },
  {
    children: INVESTMENT_SECTIONS.map((item) => ({ ...item })),
    icon: "chart-line",
    labelKey: "navigation.tabs.investments",
    routeName: "investments",
    testID: "tab-investments",
  },
  {
    children: STOCK_SECTIONS.map((item) => ({ ...item })),
    icon: "package-variant-closed",
    labelKey: "navigation.tabs.stock",
    routeName: "stock",
    testID: "tab-stock",
  },
  {
    icon: "account-group-outline",
    labelKey: "navigation.tabs.family",
    routeName: "family/index",
    testID: "tab-family",
  },
];
