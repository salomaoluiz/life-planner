import { AdaptiveLayout } from "@components";

import { useFixedIncomeTitleViewModel } from "./hooks";
import { Wide } from "./views";

function FixedIncomeTitleModal() {
  const vm = useFixedIncomeTitleViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FixedIncomeTitleModal;
