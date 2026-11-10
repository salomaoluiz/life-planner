import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useFixedIncomeContributionViewModel from "../hooks/useFixedIncomeContributionViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFixedIncomeContributionViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(
    report("fixedIncomeContribution"),
    "investment.fixedIncomeContribution.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useFixedIncomeContributionViewModel,
    { assetId: "asset-1" },
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.fixedIncomeContribution.render.mount",
  );
  view.unmount();
});
