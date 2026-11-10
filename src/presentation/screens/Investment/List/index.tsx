import { AdaptiveLayout } from "@components";

import { useInvestmentListViewModel } from "./hooks";
import { Wide } from "./views";

function InvestmentList() {
  const vm = useInvestmentListViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default InvestmentList;
