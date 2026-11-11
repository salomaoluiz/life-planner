import { AdaptiveLayout } from "@components";

import { useSuggestionsViewModel } from "./hooks";
import { Wide } from "./views";

function Suggestions() {
  const vm = useSuggestionsViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Suggestions;
