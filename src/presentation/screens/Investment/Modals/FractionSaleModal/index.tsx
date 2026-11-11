import { AdaptiveLayout } from "@components";

import { useFractionSaleModalViewModel } from "./hooks";
import { Wide } from "./views";

function FractionSaleModal() {
  const vm = useFractionSaleModalViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FractionSaleModal;
