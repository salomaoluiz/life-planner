import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useValuationModalViewModel from "../hooks/useValuationModalViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useValuationModalViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(report("valuation"), "investment.valuation.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useValuationModalViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(
    { commits: commits() },
    "investment.valuation.render.mount",
  );
  view.unmount();
});
