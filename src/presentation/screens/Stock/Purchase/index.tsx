import { AdaptiveLayout } from "@components";

import { usePurchaseViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 120: the shopping mode of a purchase (Estoque › lista › Ir às compras).
function StockPurchase() {
  const vm = usePurchaseViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockPurchase;
