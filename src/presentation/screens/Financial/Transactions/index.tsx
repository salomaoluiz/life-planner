import { AdaptiveLayout } from "@components";

import useTransactionsScreenViewModel from "./hooks/useTransactionsScreenViewModel";
import { Wide } from "./views";

function FinancialTransactions() {
  const vm = useTransactionsScreenViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FinancialTransactions;
