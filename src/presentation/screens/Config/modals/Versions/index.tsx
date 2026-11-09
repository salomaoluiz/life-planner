import { AdaptiveLayout } from "@components";

import { useVersionsViewModel } from "./hooks";
import { Wide } from "./views";

function VersionsModal() {
  const vm = useVersionsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default VersionsModal;
