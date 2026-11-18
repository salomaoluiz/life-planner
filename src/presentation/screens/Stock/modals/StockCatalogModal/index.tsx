import { AdaptiveLayout } from "@components";

import { useStockCatalogViewModel } from "./hooks";
import { Wide } from "./views";

function StockCatalogModal() {
  const vm = useStockCatalogViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockCatalogModal;
