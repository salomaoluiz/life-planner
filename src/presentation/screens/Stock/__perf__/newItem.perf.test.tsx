import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useNewStockItemViewModel from "../modals/NewStockItemModal/hooks/useNewStockItemViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewStockItemViewModel);

  expectWithinBudget(report("newItem"), "stock.newItem.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useNewStockItemViewModel);

  expectWithinBudget({ commits: commits() }, "stock.newItem.render.mount");
  view.unmount();
});
