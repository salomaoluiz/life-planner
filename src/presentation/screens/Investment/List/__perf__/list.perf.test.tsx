import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useInvestmentListViewModel from "../hooks/useInvestmentListViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInvestmentListViewModel);

  expectWithinBudget(report("list"), "investment.list.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useInvestmentListViewModel);

  expectWithinBudget({ commits: commits() }, "investment.list.render.mount");
  view.unmount();
});
