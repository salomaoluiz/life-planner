import { AdaptiveLayout } from "@components";

import { useOverviewViewModel } from "./hooks";
import { Wide } from "./views";

function FinancialOverview() {
  const vm = useOverviewViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FinancialOverview;
