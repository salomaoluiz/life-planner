import { ReactNode } from "react";

import { ScreenHeader } from "@components";
import { InvestmentSection } from "@screens/Investment/Layout/models/investmentSections";

import useSectionHeaderViewModel from "./hooks/useSectionHeaderViewModel";

export interface SectionHeaderProps {
  actions?: ReactNode;
  section: InvestmentSection;
  testID?: string;
}

// Spec 110 FR 1: the header of the investments sections, like the finance one: the module as overline and the
// section as title. Below the wide layout the title opens the section picker; on it the side menu is the picker.
function SectionHeader(props: SectionHeaderProps) {
  const vm = useSectionHeaderViewModel(props.section);

  return (
    <ScreenHeader
      actions={props.actions}
      onTitlePress={vm.onTitlePress}
      overline={vm.overline}
      testID={props.testID ?? "investment.layout.section-picker"}
      title={vm.title}
      titleAccessibilityLabel={vm.titleA11yLabel}
    />
  );
}

export default SectionHeader;
