import { AdaptiveLayout } from "@components";

import { useQuickAddViewModel } from "./hooks";
import { Wide } from "./views";

function QuickAdd() {
  const vm = useQuickAddViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default QuickAdd;
