import { AdaptiveLayout } from "@components";

import { useNewStockItemViewModel } from "./hooks";
import { Wide } from "./views";

function NewStockItemModal() {
  const vm = useNewStockItemViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default NewStockItemModal;
