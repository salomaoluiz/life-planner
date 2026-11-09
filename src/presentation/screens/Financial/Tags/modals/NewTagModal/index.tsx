import { AdaptiveLayout } from "@components";

import { useNewTagViewModel } from "./hooks";
import { Wide } from "./views";

function NewTagModal() {
  const vm = useNewTagViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default NewTagModal;
