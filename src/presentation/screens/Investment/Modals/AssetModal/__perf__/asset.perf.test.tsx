import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useAssetModalViewModel from "../hooks/useAssetModalViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useAssetModalViewModel);

  expectWithinBudget(report("asset"), "investment.asset.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useAssetModalViewModel);

  expectWithinBudget({ commits: commits() }, "investment.asset.render.mount");
  view.unmount();
});
