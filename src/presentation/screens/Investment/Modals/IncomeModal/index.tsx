import { AdaptiveLayout } from "@components";

import { useIncomeModalViewModel } from "./hooks";
import { Wide } from "./views";

function IncomeModal() {
  const vm = useIncomeModalViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default IncomeModal;
