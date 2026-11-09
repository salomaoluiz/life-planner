import { AdaptiveLayout } from "@components";

import { useCardsViewModel } from "./hooks";
import { Wide } from "./views";

function FinancialCards() {
  const vm = useCardsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FinancialCards;
