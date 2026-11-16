import { AdaptiveLayout } from "@components";

import { useInvestmentOverviewViewModel } from "./hooks";
import { Wide } from "./views";

function InvestmentOverview() {
  const vm = useInvestmentOverviewViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default InvestmentOverview;
