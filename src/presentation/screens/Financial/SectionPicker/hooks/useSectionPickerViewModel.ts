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

import sectionPickerTestIds from "../testIds";

export type SectionPickerVM = ReturnType<typeof useSectionPickerViewModel>;

export default useSectionPickerViewModel;

function useSectionPickerViewModel() {
  const { t } = useTranslation();
  const { closeModal } = useModalNavigation();
  const path = screenPath(usePathname());
  // Spec 110: the same sheet serves the investments sections; the path says which module is open.
  const investments = path.startsWith("/investments");
  const sections = investments ? INVESTMENT_SECTIONS : FINANCIAL_SECTIONS;
  const current = investments
    ? getInvestmentSection(path)
    : getFinancialSection(path);

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
    closeLabel: t(
      investments
        ? "investment.sections.pickerClose"
        : "financial.sections.pickerClose",
    ),
    onClose,
    options: sections.map((item) => {
      const selected = item.section === current;

      return {
        icon: item.icon,
        onPress: () => onChoose(item.path, selected),
        section: item.section,
        selected,
        testID: sectionPickerTestIds.option(
          item.section,
          investments ? "investment" : "financial",
        ),
        title: t(item.labelKey),
      };
    }),
    title: t(
      investments
        ? "investment.sections.pickerTitle"
        : "financial.sections.pickerTitle",
    ),
  };
}
