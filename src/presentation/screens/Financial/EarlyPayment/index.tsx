import { AdaptiveLayout } from "@components";

import { useEarlyPaymentViewModel } from "./hooks";
import { Wide } from "./views";

function EarlyPaymentModal() {
  const vm = useEarlyPaymentViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export { EarlyPaymentModal };
export default EarlyPaymentModal;
