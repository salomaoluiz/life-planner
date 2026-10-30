import { TranslationKeys } from "@presentation/i18n/types";
import { FINANCIAL_SECTIONS } from "@screens/Financial/Layout/models/financialSections";

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
  | "stock/index";

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
    icon: "package-variant-closed",
    labelKey: "navigation.tabs.stock",
    routeName: "stock/index",
    testID: "tab-stock",
  },
  {
    icon: "account-group-outline",
    labelKey: "navigation.tabs.family",
    routeName: "family/index",
    testID: "tab-family",
  },
];
