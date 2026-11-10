import { AdaptiveLayout } from "@components";

import { useFixedIncomeContributionViewModel } from "./hooks";
import { Wide } from "./views";

function FixedIncomeContributionModal() {
  const vm = useFixedIncomeContributionViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FixedIncomeContributionModal;
