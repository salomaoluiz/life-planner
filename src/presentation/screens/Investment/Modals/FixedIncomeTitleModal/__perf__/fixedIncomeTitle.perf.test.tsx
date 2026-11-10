import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useFixedIncomeTitleViewModel from "../hooks/useFixedIncomeTitleViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFixedIncomeTitleViewModel, {});

  expectWithinBudget(
    report("fixedIncomeTitle"),
    "investment.fixedIncomeTitle.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useFixedIncomeTitleViewModel,
    {},
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.fixedIncomeTitle.render.mount",
  );
  view.unmount();
});
