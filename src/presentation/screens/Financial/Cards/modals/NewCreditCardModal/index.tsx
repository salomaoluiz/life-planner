import { AdaptiveLayout } from "@components";

import { useNewCreditCardViewModel } from "./hooks";
import { Wide } from "./views";

function NewCreditCardModal() {
  const vm = useNewCreditCardViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default NewCreditCardModal;
