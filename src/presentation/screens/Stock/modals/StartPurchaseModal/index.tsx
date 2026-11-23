import { AdaptiveLayout } from "@components";

import { useStartPurchaseViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 120 FR 3: "Ir às compras": join an open purchase of the list or start another one with a market.
function StartPurchaseModal() {
  const vm = useStartPurchaseViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StartPurchaseModal;
