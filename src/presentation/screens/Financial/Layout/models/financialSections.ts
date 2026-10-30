import { TranslationKeys } from "@presentation/i18n/types";

export type FinancialSection =
  | "accounts"
  | "cards"
  | "categories"
  | "overview"
  | "tags"
  | "transactions";

export interface FinancialSectionItem {
  icon: string;
  labelKey: TranslationKeys;
  path: string;
  section: FinancialSection;
  testID: string;
}

// Order matters: it is the order of the side menu and of the section picker.
export const FINANCIAL_SECTIONS: readonly FinancialSectionItem[] = [
  {
    icon: "chart-box-outline",
    labelKey: "financial.sections.overview",
    path: "/financial/overview",
    section: "overview",
    testID: "navigation-rail-financial-overview",
  },
  {
    icon: "swap-vertical",
    labelKey: "financial.sections.transactions",
    path: "/financial/transaction",
    section: "transactions",
    testID: "navigation-rail-financial-transactions",
  },
  {
    icon: "shape-outline",
    labelKey: "financial.sections.categories",
    path: "/financial/categories",
    section: "categories",
    testID: "navigation-rail-financial-categories",
  },
  {
    icon: "tag-outline",
    labelKey: "financial.sections.tags",
    path: "/financial/tags",
    section: "tags",
    testID: "navigation-rail-financial-tags",
  },
  {
    icon: "bank-outline",
    labelKey: "financial.sections.accounts",
    path: "/financial/accounts",
    section: "accounts",
    testID: "navigation-rail-financial-accounts",
  },
  {
    icon: "credit-card-outline",
    labelKey: "financial.sections.cards",
    path: "/financial/cards",
    section: "cards",
    testID: "navigation-rail-financial-cards",
  },
];

export function getFinancialSection(pathname: string): FinancialSection {
  const normalized = pathname.replace(/\/+$/, "");

  if (normalized.endsWith("/financial/transaction")) {
    return "transactions";
  }
  if (normalized.endsWith("/financial/overview")) {
    return "overview";
  }
  if (normalized.endsWith("/financial/tags")) {
    return "tags";
  }
  if (normalized.endsWith("/financial/categories")) {
    return "categories";
  }
  if (normalized.endsWith("/financial/cards")) {
    return "cards";
  }
  if (normalized.endsWith("/financial/accounts")) {
    return "accounts";
  }

  return "transactions";
}

export function getFinancialSectionPath(section: FinancialSection): string {
  const item = FINANCIAL_SECTIONS.find(
    (candidate) => candidate.section === section,
  );

  return item ? item.path : "/financial/transaction";
}
