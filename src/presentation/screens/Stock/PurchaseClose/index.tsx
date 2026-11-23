import { AdaptiveLayout } from "@components";

import { usePurchaseCloseViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 120 FR 27-36: the closing wizard (prices and receipt, new items, expirations, payment).
function StockPurchaseClose() {
  const vm = usePurchaseCloseViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockPurchaseClose;
