import { AdaptiveLayout } from "@components";

import { useStockViewModel } from "./hooks";
import { Wide } from "./views";

function Stock() {
  const vm = useStockViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Stock;
