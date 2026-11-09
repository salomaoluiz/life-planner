import { AdaptiveLayout } from "@components";

import { useAccountsViewModel } from "./hooks";
import { Wide } from "./views";

function FinancialAccounts() {
  const vm = useAccountsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FinancialAccounts;
