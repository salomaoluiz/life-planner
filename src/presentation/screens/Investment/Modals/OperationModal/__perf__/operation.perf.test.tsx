import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useOperationModalViewModel from "../hooks/useOperationModalViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useOperationModalViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(report("operation"), "investment.operation.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useOperationModalViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(
    { commits: commits() },
    "investment.operation.render.mount",
  );
  view.unmount();
});
