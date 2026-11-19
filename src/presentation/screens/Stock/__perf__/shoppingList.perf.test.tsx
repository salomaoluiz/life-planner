import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useShoppingListViewModel from "../modals/ShoppingListModal/hooks/useShoppingListViewModel";

setupPerf();

// Spec 118: "Nova lista" / "Editar lista".
it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useShoppingListViewModel);

  expectWithinBudget(report("shoppingList"), "stock.shoppingList.mount.cold");
  view.unmount();
});
