import { router, usePathname } from "expo-router";

import { useTranslation } from "@presentation/i18n";
import {
  FINANCIAL_SECTIONS,
  getFinancialSection,
} from "@screens/Financial/Layout/models/financialSections";

import sectionPickerTestIds from "../testIds";

function useSectionPickerViewModel() {
  const { t } = useTranslation();
  const current = getFinancialSection(usePathname());

  function onClose() {
    router.back();
  }

  function onChoose(path: string, selected: boolean) {
    router.back();
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
