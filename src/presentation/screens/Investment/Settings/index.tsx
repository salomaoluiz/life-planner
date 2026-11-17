import { AdaptiveLayout } from "@components";

import { useInvestmentSettingsViewModel } from "./hooks";
import { Wide } from "./views";

function InvestmentSettings() {
  const vm = useInvestmentSettingsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default InvestmentSettings;
