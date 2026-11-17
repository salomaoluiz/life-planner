import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useStockCatalogViewModel from "../modals/StockCatalogModal/hooks/useStockCatalogViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStockCatalogViewModel);

  expectWithinBudget(report("catalog"), "stock.catalog.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useStockCatalogViewModel);

  expectWithinBudget({ commits: commits() }, "stock.catalog.render.mount");
  view.unmount();
});
