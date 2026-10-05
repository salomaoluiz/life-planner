import { router, usePathname } from "expo-router";

import { useTranslation } from "@presentation/i18n";

import {
  FinancialSection,
  getFinancialSection,
  getFinancialSectionPath,
} from "../models/financialSections";

function useFinancialLayoutViewModel() {
  const { t } = useTranslation();
  const section = getFinancialSection(usePathname());

  function onSectionChange(next: string) {
    if (next === section) {
      return;
    }

    // replace: switching segments must not grow the back stack
    router.replace(getFinancialSectionPath(next as FinancialSection) as never);
  }

  return {
    onSectionChange,
    options: [
      { label: t("financial.sections.transactions"), value: "transactions" },
      { label: t("financial.sections.categories"), value: "categories" },
      { label: t("financial.sections.accounts"), value: "accounts" },
    ],
    section,
    title: t("navigation.tabs.finances"),
  };
}

export default useFinancialLayoutViewModel;
