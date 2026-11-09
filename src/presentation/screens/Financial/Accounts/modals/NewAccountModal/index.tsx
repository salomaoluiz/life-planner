import { AdaptiveLayout } from "@components";

import { useNewAccountViewModel } from "./hooks";
import { Wide } from "./views";

function NewAccountModal() {
  const vm = useNewAccountViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default NewAccountModal;
