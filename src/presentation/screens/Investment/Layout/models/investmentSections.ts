import { TranslationKeys } from "@presentation/i18n/types";

export type InvestmentSection = "assets" | "history" | "overview" | "settings";

export interface InvestmentSectionItem {
  icon: string;
  labelKey: TranslationKeys;
  path: string;
  section: InvestmentSection;
  testID: string;
}

// Spec 110 FR 1: like the finance sections, the investments sections live in the side menu and the section picker.
// Order matters: it is the order of the menu and of the picker.
export const INVESTMENT_SECTIONS: readonly InvestmentSectionItem[] = [
  {
    icon: "chart-box-outline",
    labelKey: "investment.sections.overview",
    path: "/investments/overview",
    section: "overview",
    testID: "navigation-rail-investment-overview",
  },
  {
    icon: "format-list-bulleted",
    labelKey: "investment.sections.assets",
    path: "/investments",
    section: "assets",
    testID: "navigation-rail-investment-assets",
  },
  {
    icon: "history",
    labelKey: "investment.sections.history",
    path: "/investments/history",
    section: "history",
    testID: "navigation-rail-investment-history",
  },
  {
    icon: "cog-outline",
    labelKey: "investment.sections.settings",
    path: "/investments/settings",
    section: "settings",
    testID: "navigation-rail-investment-settings",
  },
];

// Spec 113: Settings is a section of its own; the asset detail and the suggestions inbox belong to Assets.
export function getInvestmentSection(pathname: string): InvestmentSection {
  const normalized = pathname.replace(/\/+$/, "");

  if (normalized.endsWith("/investments/overview")) {
    return "overview";
  }
  if (normalized.endsWith("/investments/history")) {
    return "history";
  }
  if (normalized.endsWith("/investments/settings")) {
    return "settings";
  }

  return normalized === "/investments" || normalized.startsWith("/investments/")
    ? "assets"
    : "overview";
}

export function getInvestmentSectionPath(section: InvestmentSection): string {
  const item = INVESTMENT_SECTIONS.find(
    (candidate) => candidate.section === section,
  );

  return item ? item.path : "/investments/overview";
}
