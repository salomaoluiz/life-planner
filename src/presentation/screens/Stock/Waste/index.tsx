import { AdaptiveLayout } from "@components";

import { useStockWasteViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 123: Estoque › Desperdício (what was thrown away in a month, by reason, category and item).
function StockWaste() {
  const vm = useStockWasteViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockWaste;
