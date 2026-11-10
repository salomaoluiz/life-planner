import { AdaptiveLayout } from "@components";

import { useFixedIncomeAdjustViewModel } from "./hooks";
import { Wide } from "./views";

function FixedIncomeAdjustModal() {
  const vm = useFixedIncomeAdjustViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FixedIncomeAdjustModal;
