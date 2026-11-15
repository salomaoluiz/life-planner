import { router } from "expo-router";

import { useTranslation } from "@presentation/i18n";

import { INVESTMENT_SECTIONS, InvestmentSection } from "../models/sections";

// The tab row of the module: the active section (known by the screen) and where each tab goes (spec 110 FR 1).
function useInvestmentSections(active: InvestmentSection) {
  const { t } = useTranslation();

  return {
    onSelect: (next: string) => {
      if (next !== active) {
        router.push(
          next === "assets" ? "/investments/assets" : "/investments/overview",
        );
      }
    },
    section: active,
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
