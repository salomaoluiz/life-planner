import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useInvestmentDetailViewModel from "../hooks/useInvestmentDetailViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInvestmentDetailViewModel, {
    id: "asset-1",
  });

  expectWithinBudget(report("detail"), "investment.detail.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useInvestmentDetailViewModel,
    { id: "asset-1" },
  );

  expectWithinBudget({ commits: commits() }, "investment.detail.render.mount");
  view.unmount();
});
