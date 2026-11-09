import { AdaptiveLayout } from "@components";
import { useFamilyViewModel } from "@screens/Family/hooks";

import { Wide } from "./views";

function Family() {
  const vm = useFamilyViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Family;
