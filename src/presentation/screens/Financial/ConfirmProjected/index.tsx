import { AdaptiveLayout } from "@components";

import { useConfirmProjectedViewModel } from "./hooks";
import { Wide } from "./views";

function ConfirmProjectedModal() {
  const vm = useConfirmProjectedViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export { ConfirmProjectedModal };
export default ConfirmProjectedModal;
