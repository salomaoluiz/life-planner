import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useFixedIncomeRateViewModel from "../hooks/useFixedIncomeRateViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFixedIncomeRateViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(
    report("fixedIncomeRate"),
    "investment.fixedIncomeRate.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useFixedIncomeRateViewModel,
    { assetId: "asset-1" },
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.fixedIncomeRate.render.mount",
  );
  view.unmount();
});
