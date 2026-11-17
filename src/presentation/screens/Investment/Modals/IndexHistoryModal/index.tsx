import { AdaptiveLayout } from "@components";

import { useIndexHistoryViewModel } from "./hooks";
import { Wide } from "./views";

function IndexHistoryModal() {
  const vm = useIndexHistoryViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default IndexHistoryModal;
