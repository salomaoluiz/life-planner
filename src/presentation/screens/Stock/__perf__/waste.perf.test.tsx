import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useStockWasteViewModel from "../Waste/hooks/useStockWasteViewModel";

setupPerf();

// Spec 123: Estoque › Desperdício.
it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStockWasteViewModel);

  expectWithinBudget(report("waste"), "stock.waste.mount.cold");
  view.unmount();
});
