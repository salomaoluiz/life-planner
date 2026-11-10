import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useFixedIncomeRedeemViewModel from "../hooks/useFixedIncomeRedeemViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFixedIncomeRedeemViewModel, {
    assetId: "asset-1",
  });

  expectWithinBudget(
    report("fixedIncomeRedeem"),
    "investment.fixedIncomeRedeem.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useFixedIncomeRedeemViewModel,
    { assetId: "asset-1" },
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.fixedIncomeRedeem.render.mount",
  );
  view.unmount();
});
