import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useIncomeModalViewModel from "../hooks/useIncomeModalViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useIncomeModalViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(report("income"), "investment.income.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useIncomeModalViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget({ commits: commits() }, "investment.income.render.mount");
  view.unmount();
});
