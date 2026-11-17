import { AdaptiveLayout } from "@components";

import { useConversionModalViewModel } from "./hooks";
import { Wide } from "./views";

function ConversionModal() {
  const vm = useConversionModalViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default ConversionModal;
