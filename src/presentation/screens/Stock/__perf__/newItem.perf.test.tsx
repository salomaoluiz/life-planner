import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useNewStockItemViewModel from "../modals/NewStockItemModal/hooks/useNewStockItemViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewStockItemViewModel);

  expectWithinBudget(report("newItem"), "stock.newItem.mount.cold");
  view.unmount();
});
