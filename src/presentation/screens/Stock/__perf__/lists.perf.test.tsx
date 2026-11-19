import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useStockListsViewModel from "../Lists/hooks/useStockListsViewModel";

setupPerf();

// Spec 118: Estoque › Listas.
it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStockListsViewModel);

  expectWithinBudget(report("lists"), "stock.lists.mount.cold");
  view.unmount();
});
