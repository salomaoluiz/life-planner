import { AdaptiveLayout } from "@components";

import { useIncomeReceiveModalViewModel } from "./hooks";
import { Wide } from "./views";

function IncomeReceiveModal() {
  const vm = useIncomeReceiveModalViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default IncomeReceiveModal;
