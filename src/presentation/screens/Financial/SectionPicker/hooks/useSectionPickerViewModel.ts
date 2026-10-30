import { router, usePathname } from "expo-router";

import { useTranslation } from "@presentation/i18n";
import {
  FINANCIAL_SECTIONS,
  getFinancialSection,
} from "@screens/Financial/Layout/models/financialSections";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { screenPath } from "@screens/Navigation/models/modalPath";

import sectionPickerTestIds from "../testIds";

function useSectionPickerViewModel() {
  const { t } = useTranslation();
  const { closeModal } = useModalNavigation();
  const current = getFinancialSection(screenPath(usePathname()));

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
    closeLabel: t("financial.sections.pickerClose"),
    onClose,
    options: FINANCIAL_SECTIONS.map((item) => {
      const selected = item.section === current;

      return {
        icon: item.icon,
        onPress: () => onChoose(item.path, selected),
        section: item.section,
        selected,
        testID: sectionPickerTestIds.option(item.section),
        title: t(item.labelKey),
      };
    }),
    title: t("financial.sections.pickerTitle"),
  };
}

export default useSectionPickerViewModel;
