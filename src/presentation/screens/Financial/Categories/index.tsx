import { AdaptiveLayout } from "@components";

import { useCategoriesViewModel } from "./hooks";
import { Wide } from "./views";

function FinancialCategories() {
  const vm = useCategoriesViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FinancialCategories;
