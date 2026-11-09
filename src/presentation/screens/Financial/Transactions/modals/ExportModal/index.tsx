import { AdaptiveLayout } from "@components";

import useExportModalViewModel from "./useExportModalViewModel";
import { Wide } from "./views";
import { ExportModalParams } from "./vm";

function ExportModal(props: ExportModalParams) {
  const vm = useExportModalViewModel(props);

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default ExportModal;
