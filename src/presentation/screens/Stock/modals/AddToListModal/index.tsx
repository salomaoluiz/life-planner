import { AdaptiveLayout } from "@components";

import { useAddToListViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 118 FR 16: add a stock item to one of the lists of its owner.
function AddToListModal() {
  const vm = useAddToListViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default AddToListModal;
