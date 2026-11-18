import { AdaptiveLayout } from "@components";

import { useStockListsViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 118: the lists of the family and of the person (Estoque › Listas).
function StockLists() {
  const vm = useStockListsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockLists;
