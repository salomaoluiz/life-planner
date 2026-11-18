import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { stockDetail } from "@tests/perf/fixtures/stock";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useAddToListViewModel from "../modals/AddToListModal/hooks/useAddToListViewModel";

setupPerf();

// Spec 118 FR 16: "Adicionar à lista" from an item.
it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useAddToListViewModel, {
    itemId: stockDetail.id,
  });

  expectWithinBudget(report("addToList"), "stock.addToList.mount.cold");
  view.unmount();
});
