import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useInvestmentOverviewViewModel from "../hooks/useInvestmentOverviewViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInvestmentOverviewViewModel);

  expectWithinBudget(report("overview"), "investment.overview.mount.cold");
  view.unmount();
});

it("SHOULD keep the entry route within the same request budget", async () => {
  const view = await openScreen(useInvestmentOverviewViewModel);

  expectWithinBudget(report("overview"), "investment.overview.mount.entry");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useInvestmentOverviewViewModel,
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.overview.render.mount",
  );
  view.unmount();
});
