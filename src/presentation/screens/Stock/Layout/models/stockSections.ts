import { TranslationKeys } from "@presentation/i18n/types";

export type StockSection = "catalog" | "items" | "lists";

export interface StockSectionItem {
  icon: string;
  labelKey: TranslationKeys;
  path: string;
  section: StockSection;
  testID: string;
}

// Spec 118 FR 25: Stock becomes a section menu like Finances and Investments. Order = menu and picker order.
export const STOCK_SECTIONS: readonly StockSectionItem[] = [
  {
    icon: "package-variant-closed",
    labelKey: "stock.sections.items",
    path: "/stock",
    section: "items",
    testID: "navigation-rail-stock-items",
  },
  {
    icon: "cart-outline",
    labelKey: "stock.sections.lists",
    path: "/stock/lists",
    section: "lists",
    testID: "navigation-rail-stock-lists",
  },
  {
    icon: "shape-outline",
    labelKey: "stock.sections.catalog",
    path: "/stock/catalog",
    section: "catalog",
    testID: "navigation-rail-stock-catalog",
  },
];

// The list detail (`/stock/list/<id>`, singular so `/stock/lists/<modal>` is never read as an id) belongs to Lists; the location QR route (`/stock/locations/<id>`) belongs to Items.
export function getStockSection(pathname: string): StockSection {
  const normalized = pathname.replace(/\/+$/, "");

  if (
    normalized === "/stock/lists" ||
    normalized.startsWith("/stock/lists/") ||
    normalized.startsWith("/stock/list/") ||
    normalized.startsWith("/stock/purchases/") ||
    normalized.startsWith("/stock/purchase-close/")
  ) {
    return "lists";
  }

  return normalized === "/stock/catalog" ? "catalog" : "items";
}

export function getStockSectionPath(section: StockSection): string {
  const item = STOCK_SECTIONS.find(
    (candidate) => candidate.section === section,
  );

  return item ? item.path : "/stock";
}
