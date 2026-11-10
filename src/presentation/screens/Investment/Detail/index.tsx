import { AdaptiveLayout } from "@components";

import { useInvestmentDetailViewModel } from "./hooks";
import { Wide } from "./views";

function InvestmentDetail() {
  const vm = useInvestmentDetailViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default InvestmentDetail;
