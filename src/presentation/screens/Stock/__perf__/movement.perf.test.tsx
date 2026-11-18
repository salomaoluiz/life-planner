import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { stockDetail } from "@tests/perf/fixtures/stock";
import { USER_ID } from "@tests/perf/fixtures/user";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useStockMovementViewModel from "../modals/StockMovementModal/hooks/useStockMovementViewModel";

setupPerf();

const params = { itemId: stockDetail.id, ownerId: USER_ID, type: "CONSUME" };

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStockMovementViewModel, params);

  expectWithinBudget(report("movement"), "stock.movement.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useStockMovementViewModel,
    params,
  );

  expectWithinBudget({ commits: commits() }, "stock.movement.render.mount");
  view.unmount();
});
