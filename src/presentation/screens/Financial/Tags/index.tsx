import { AdaptiveLayout } from "@components";

import { useTagsViewModel } from "./hooks";
import { Wide } from "./views";

function FinancialTags() {
  const vm = useTagsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FinancialTags;
