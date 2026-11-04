import "@tests/perf/mocks";
import { act } from "@tests";
import { expectWithinBudget } from "@tests/perf/budgets";
import { USER_ID } from "@tests/perf/fixtures/user";
import * as network from "@tests/perf/networkHarness";
import {
  countHookCommits,
  flush,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";

import useStockViewModel from "../hooks/useStockViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useStockViewModel);

  expectWithinBudget(report("list"), "stock.list.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useStockViewModel);

  expectWithinBudget({ commits: commits() }, "stock.list.render.mount");
  view.unmount();
});

it("SHOULD create an item within the request budget", async () => {
  // The list stays mounted while the same mutation the modal runs (cache key and fetch) is sent.
  const view = await openScreen(() => ({
    add: useMutation({
      cacheKey: [useCases.createStockItemUseCase.uniqueName],
      fetch: useCases.createStockItemUseCase.execute,
    }),
    list: useStockViewModel(),
  }));

  network.mark();
  await act(async () => {
    view.result.current.add.mutate({
      description: "Rice",
      owner: "USER",
      ownerId: USER_ID,
      quantity: 1,
      unit: "unit",
    });
    await flush();
  });

  expectWithinBudget(report("create"), "stock.write.create");
  view.unmount();
});
