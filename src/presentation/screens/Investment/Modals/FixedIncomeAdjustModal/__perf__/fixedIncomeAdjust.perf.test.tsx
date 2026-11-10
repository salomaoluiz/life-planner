import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useFixedIncomeAdjustViewModel from "../hooks/useFixedIncomeAdjustViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFixedIncomeAdjustViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(
    report("fixedIncomeAdjust"),
    "investment.fixedIncomeAdjust.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useFixedIncomeAdjustViewModel,
    { assetId: "asset-1" },
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.fixedIncomeAdjust.render.mount",
  );
  view.unmount();
});
