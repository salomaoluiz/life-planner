import { AdaptiveLayout } from "@components";

import { useFixedIncomeRedeemViewModel } from "./hooks";
import { Wide } from "./views";

function FixedIncomeRedeemModal() {
  const vm = useFixedIncomeRedeemViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FixedIncomeRedeemModal;
