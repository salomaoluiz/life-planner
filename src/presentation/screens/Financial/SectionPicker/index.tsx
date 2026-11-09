import { AdaptiveLayout } from "@components";

import { useSectionPickerViewModel } from "./hooks";
import { Wide } from "./views";

function SectionPicker() {
  const vm = useSectionPickerViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default SectionPicker;
