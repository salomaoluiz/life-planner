import { AdaptiveLayout } from "@components";

import { useFixedIncomeRateViewModel } from "./hooks";
import { Wide } from "./views";

function FixedIncomeRateModal() {
  const vm = useFixedIncomeRateViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FixedIncomeRateModal;
