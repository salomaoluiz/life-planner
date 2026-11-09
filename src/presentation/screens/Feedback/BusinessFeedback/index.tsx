import { AdaptiveLayout } from "@components";

import { useBusinessFeedbackViewModel } from "./hooks";
import { Wide } from "./views";

function BusinessFeedback() {
  const vm = useBusinessFeedbackViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default BusinessFeedback;
