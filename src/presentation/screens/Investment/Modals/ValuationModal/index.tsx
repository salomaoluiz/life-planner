import { AdaptiveLayout } from "@components";

import { useValuationModalViewModel } from "./hooks";
import { Wide } from "./views";

function ValuationModal() {
  const vm = useValuationModalViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default ValuationModal;
