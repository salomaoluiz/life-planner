import { useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import {
  INVESTMENT_SECTIONS,
  InvestmentSection,
} from "@screens/Investment/Layout/models/investmentSections";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

function useSectionHeaderViewModel(section: InvestmentSection) {
  const { t } = useTranslation();
  const { openModal } = useModalNavigation();
  const expanded = useBreakpoint() === "expanded";
  const item = INVESTMENT_SECTIONS.find(
    (candidate) => candidate.section === section,
  );
  const title = t(item?.labelKey ?? "investment.sections.overview");

  function onTitlePress() {
    openModal("section_picker");
  }

  return {
    // On the wide layout the side menu is the picker, the title is plain text.
    onTitlePress: expanded ? undefined : onTitlePress,
    overline: t("navigation.tabs.investments"),
    title,
    titleA11yLabel: t("investment.sections.pickerA11yLabel", {
      section: title,
    }),
  };
}

export default useSectionHeaderViewModel;
