import { AdaptiveLayout } from "@components";

import { useStockCatalogScreenViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 118 FR 25: the third section of the stock menu.
function StockCatalog() {
  const vm = useStockCatalogScreenViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockCatalog;
