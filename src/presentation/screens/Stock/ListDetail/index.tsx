import { AdaptiveLayout } from "@components";

import { useStockListDetailViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 118: one shopping list, grouped by category (Estoque › Listas › list).
function StockListDetail() {
  const vm = useStockListDetailViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockListDetail;
