import { AdaptiveLayout } from "@components";

import { useStockMovementViewModel } from "./hooks";
import { Wide } from "./views";

function StockMovementModal() {
  const vm = useStockMovementViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default StockMovementModal;
