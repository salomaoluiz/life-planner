import { router, usePathname } from "expo-router";

import { useTranslation } from "@presentation/i18n";

import { getInvestmentSection, INVESTMENT_SECTIONS } from "../models/sections";

// The tab row of the module: the current section and where each tab goes (spec 110 FR 1).
function useInvestmentSections() {
  const { t } = useTranslation();
  const section = getInvestmentSection(usePathname());

  return {
    onSelect: (next: string) => {
      if (next !== section) {
        router.push(
          next === "assets" ? "/investments/assets" : "/investments/overview",
        );
      }
    },
    section,
    tabs: INVESTMENT_SECTIONS.map((entry) => ({
      label: t(entry.labelKey),
      section: entry.section,
      testID:
        entry.section === "assets"
          ? "investment.sections.assets"
          : "investment.sections.overview",
    })),
  };
}

export default useInvestmentSections;
