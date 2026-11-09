import { AdaptiveLayout } from "@components";

import useImportWizardViewModel from "./useImportWizardViewModel";
import { Wide } from "./views";
import { ImportWizardParams } from "./vm";

function ImportWizard(props: ImportWizardParams) {
  const vm = useImportWizardViewModel(props);

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default ImportWizard;
