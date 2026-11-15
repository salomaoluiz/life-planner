import { TranslationKeys } from "@presentation/i18n/types";

export type InvestmentSection = "assets" | "overview";

export interface InvestmentSectionEntry {
  labelKey: TranslationKeys;
  path: string;
  section: InvestmentSection;
}

// Spec 110 FR 1: the investments module has two sections, Overview first and the 102 list after it.
export const INVESTMENT_SECTIONS: InvestmentSectionEntry[] = [
  {
    labelKey: "investment.overview.title",
    path: "overview",
    section: "overview",
  },
  {
    labelKey: "investment.overview.assets",
    path: "assets",
    section: "assets",
  },
];

export function getInvestmentSection(pathname: string): InvestmentSection {
  const parts = pathname.split("/").filter(Boolean);

  return parts.includes("assets") || parts.includes("asset")
    ? "assets"
    : "overview";
}
