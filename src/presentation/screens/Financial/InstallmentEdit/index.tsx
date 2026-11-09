import { AdaptiveLayout } from "@components";

import { useInstallmentEditViewModel } from "./hooks";
import { Wide } from "./views";

function InstallmentEditModal() {
  const vm = useInstallmentEditViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export { InstallmentEditModal };
export default InstallmentEditModal;
