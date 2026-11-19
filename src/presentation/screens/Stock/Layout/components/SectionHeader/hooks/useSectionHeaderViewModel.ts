import { useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import {
  STOCK_SECTIONS,
  StockSection,
} from "@screens/Stock/Layout/models/stockSections";

function useSectionHeaderViewModel(section: StockSection, title?: string) {
  const { t } = useTranslation();
  const { openModal } = useModalNavigation();
  const expanded = useBreakpoint() === "expanded";
  const item = STOCK_SECTIONS.find(
    (candidate) => candidate.section === section,
  );
  const sectionTitle = t(item?.labelKey ?? "stock.sections.items");

  function onTitlePress() {
    openModal("section_picker");
  }

  return {
    // On the wide layout the side menu is the picker, the title is plain text.
    onTitlePress: expanded ? undefined : onTitlePress,
    overline: t("navigation.tabs.stock"),
    title: title ?? sectionTitle,
    titleA11yLabel: t("stock.sections.pickerA11yLabel", {
      section: sectionTitle,
    }),
  };
}

export default useSectionHeaderViewModel;
