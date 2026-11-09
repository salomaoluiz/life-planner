import { AdaptiveLayout } from "@components";

import { useNewCategoryViewModel } from "./hooks";
import { Wide } from "./views";

function NewCategoryModal() {
  const vm = useNewCategoryViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default NewCategoryModal;
