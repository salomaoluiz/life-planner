import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useNewAccountViewModel from "../modals/NewAccountModal/hooks/useNewAccountViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewAccountViewModel);

  expectWithinBudget(report("newAccount"), "financial.newAccount.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useNewAccountViewModel);

  expectWithinBudget(
    { commits: commits() },
    "financial.newAccount.render.mount",
  );
  view.unmount();
});
