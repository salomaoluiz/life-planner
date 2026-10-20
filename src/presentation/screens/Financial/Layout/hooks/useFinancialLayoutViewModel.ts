import { router, usePathname } from "expo-router";

import { useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import { SECTION_PICKER_PATH } from "@screens/Navigation/models/navigationItems";

import {
  FINANCIAL_SECTIONS,
  getFinancialSection,
} from "../models/financialSections";

function useFinancialLayoutViewModel() {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const section = getFinancialSection(usePathname());
  const current = FINANCIAL_SECTIONS.find((item) => item.section === section);
  const title = current ? t(current.labelKey) : t("navigation.tabs.finances");

  function onTitlePress() {
    router.push(SECTION_PICKER_PATH as never);
  }

  return {
    // On the wide layout the side menu is the picker, the title is plain text.
    onTitlePress: breakpoint === "expanded" ? undefined : onTitlePress,
    overline: t("navigation.tabs.finances"),
    section,
    title,
    titleA11yLabel: t("financial.sections.pickerA11yLabel", { section: title }),
  };
}

export default useFinancialLayoutViewModel;
