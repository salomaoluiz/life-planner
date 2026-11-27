import { AdaptiveLayout } from "@components";

import { useBatchViewModel } from "./hooks";
import { Wide } from "./views";

function ActivityBatchModal() {
  const vm = useBatchViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export { ActivityBatchModal };
export default ActivityBatchModal;
