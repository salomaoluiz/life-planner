import { AdaptiveLayout } from "@components";

import { useShoppingListViewModel } from "./hooks";
import { Wide } from "./views";

// Spec 118: "Nova lista" and "Editar lista".
function ShoppingListModal() {
  const vm = useShoppingListViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default ShoppingListModal;
