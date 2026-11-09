import { AdaptiveLayout } from "@components";

import { usePrepaymentViewModel } from "./hooks";
import { Wide } from "./views";

function PrepaymentModal() {
  const vm = usePrepaymentViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export { PrepaymentModal };
export default PrepaymentModal;
