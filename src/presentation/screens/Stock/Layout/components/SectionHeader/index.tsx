import { ReactNode } from "react";

import { ScreenHeader } from "@components";
import { StockSection } from "@screens/Stock/Layout/models/stockSections";

import useSectionHeaderViewModel from "./hooks/useSectionHeaderViewModel";

export interface SectionHeaderProps {
  actions?: ReactNode;
  section: StockSection;
  subtitle?: string;
  testID?: string;
  // The detail of a section names itself (a location, a list); the section stays in the picker.
  title?: string;
}

// Spec 118 FR 25: the header of the stock sections, like finances and investments: the module as overline and the
// section as title. Below the wide layout the title opens the section picker.
function SectionHeader(props: SectionHeaderProps) {
  const vm = useSectionHeaderViewModel(props.section, props.title);

  return (
    <ScreenHeader
      actions={props.actions}
      onTitlePress={vm.onTitlePress}
      overline={vm.overline}
      subtitle={props.subtitle}
      testID={props.testID ?? "stock.layout.section-picker"}
      title={vm.title}
      titleAccessibilityLabel={vm.titleA11yLabel}
    />
  );
}

export default SectionHeader;
