import { TranslationKeys } from "@presentation/i18n/types";

export type InvestmentSection = "assets" | "overview";

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
];

// The asset detail and the suggestions inbox belong to the Assets section.
export function getInvestmentSection(pathname: string): InvestmentSection {
  const normalized = pathname.replace(/\/+$/, "");

  if (normalized.endsWith("/investments/overview")) {
    return "overview";
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
