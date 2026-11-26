import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useStockCatalogScreenViewModel from "../Catalog/hooks/useStockCatalogScreenViewModel";

setupPerf();

// Spec 125: Estoque › Categorias e locais reads both trees once ("Todos"); the modals read nothing until opened.
it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStockCatalogScreenViewModel);

  expectWithinBudget(report("catalogScreen"), "stock.catalogScreen.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useStockCatalogScreenViewModel,
  );

  expectWithinBudget(
    { commits: commits() },
    "stock.catalogScreen.render.mount",
  );
  view.unmount();
});
