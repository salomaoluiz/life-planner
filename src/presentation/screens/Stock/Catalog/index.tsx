import { AdaptiveLayout } from "@components";

import { useStockCatalogScreenViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 125: the "Categorias e locais" screen (tabs Categorias | Locais), like Finance > Categories.
function StockCatalog() {
  const vm = useStockCatalogScreenViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockCatalog;
