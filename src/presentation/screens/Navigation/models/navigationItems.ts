import { TranslationKeys } from "@presentation/i18n/types";

export interface NavigationItem {
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

export const QUICK_ADD_PATH = "/quick_add";
export const SETTINGS_PATH = "/settings";
export const STOCK_ITEM_ADD_PATH = "/stock/add_new_stock_item";
export const TRANSACTION_ADD_PATH =
  "/financial/transaction/add_new_transaction";

// Order matters: the bottom bar puts the quick-add button between the 2nd and 3rd item.
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    icon: "home-outline",
    labelKey: "navigation.tabs.home",
    routeName: "index/index",
    testID: "tab-home",
  },
  {
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
