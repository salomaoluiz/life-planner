import { AdaptiveLayout } from "@components";

import { useRefundViewModel } from "./hooks";
import { Wide } from "./views";

function RefundModal() {
  const vm = useRefundViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export { RefundModal };
export default RefundModal;
