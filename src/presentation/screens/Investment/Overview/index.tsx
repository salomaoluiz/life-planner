import { AdaptiveLayout } from "@components";

import useInvestmentOverviewViewModel from "./hooks/useInvestmentOverviewViewModel";
import { Wide } from "./views";

// Spec 110: the investments overview, the module's landing section.
function InvestmentOverview() {
  const vm = useInvestmentOverviewViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default InvestmentOverview;
