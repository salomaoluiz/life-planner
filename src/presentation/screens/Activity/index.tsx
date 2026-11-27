import { AdaptiveLayout } from "@components";

import { useActivityViewModel } from "./hooks";
import { Compact, Wide } from "./views";

// Spec 127: the activity history of Finance and Investments (read-only), opened from the section menu of each module.
function Activity() {
  const vm = useActivityViewModel();

  return <AdaptiveLayout compact={Compact} vm={vm} wide={Wide} />;
}

export default Activity;
