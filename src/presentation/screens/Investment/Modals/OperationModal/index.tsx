import { AdaptiveLayout } from "@components";

import { useOperationModalViewModel } from "./hooks";
import { Wide } from "./views";

function OperationModal() {
  const vm = useOperationModalViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default OperationModal;
