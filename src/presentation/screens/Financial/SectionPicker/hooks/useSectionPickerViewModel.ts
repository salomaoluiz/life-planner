import { router, usePathname } from "expo-router";

import { useTranslation } from "@presentation/i18n";
import {
  FINANCIAL_SECTIONS,
  getFinancialSection,
} from "@screens/Financial/Layout/models/financialSections";
import {
  getInvestmentSection,
  INVESTMENT_SECTIONS,
} from "@screens/Investment/Layout/models/investmentSections";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { screenPath } from "@screens/Navigation/models/modalPath";
import {
  getStockSection,
  STOCK_SECTIONS,
} from "@screens/Stock/Layout/models/stockSections";

import sectionPickerTestIds from "../testIds";

export type SectionPickerVM = ReturnType<typeof useSectionPickerViewModel>;

export default useSectionPickerViewModel;

function moduleOf(path: string): "financial" | "investment" | "stock" {
  if (path.startsWith("/investments")) {
    return "investment";
  }

  return path.startsWith("/stock") ? "stock" : "financial";
}

function useSectionPickerViewModel() {
  const { t } = useTranslation();
  const { closeModal } = useModalNavigation();
  const path = screenPath(usePathname());
  // Spec 110 and 118: the same sheet serves the investments and stock sections; the path says which module is open.
  const module = moduleOf(path);
  const sections = {
    financial: FINANCIAL_SECTIONS,
    investment: INVESTMENT_SECTIONS,
    stock: STOCK_SECTIONS,
  }[module];
  const current = {
    financial: getFinancialSection,
    investment: getInvestmentSection,
    stock: getStockSection,
  }[module](path);

  function onClose() {
    closeModal();
  }

  function onChoose(path: string, selected: boolean) {
    closeModal();
    if (!selected) {
      // replace: switching sections must not grow the back stack
      router.replace(path as never);
    }
  }

  return {
    closeLabel: t(`${module}.sections.pickerClose` as const),
    onClose,
    options: sections.map((item) => {
      const selected = item.section === current;

      return {
        icon: item.icon,
        onPress: () => onChoose(item.path, selected),
        section: item.section,
        selected,
        testID: sectionPickerTestIds.option(item.section, module),
        title: t(item.labelKey),
      };
    }),
    title: t(`${module}.sections.pickerTitle` as const),
  };
}
