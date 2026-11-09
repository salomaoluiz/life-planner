import { AdaptiveLayout } from "@components";

import { useAssetModalViewModel } from "./hooks";
import { Wide } from "./views";

function AssetModal() {
  const vm = useAssetModalViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default AssetModal;
