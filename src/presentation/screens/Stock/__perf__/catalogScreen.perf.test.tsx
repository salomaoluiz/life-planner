import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useStockCatalogScreenViewModel from "../Catalog/hooks/useStockCatalogScreenViewModel";

setupPerf();

// Spec 118: Estoque › Categorias e locais (opens the catalog sheet on demand, so it reads nothing).
it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStockCatalogScreenViewModel);

  expectWithinBudget(report("catalogScreen"), "stock.catalogScreen.mount.cold");
  view.unmount();
});
