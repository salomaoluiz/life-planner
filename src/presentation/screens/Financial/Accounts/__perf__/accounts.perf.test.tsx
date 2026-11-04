import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useAccountsViewModel from "../hooks/useAccountsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useAccountsViewModel);

  expectWithinBudget(report("accounts"), "financial.accounts.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useAccountsViewModel);

  expectWithinBudget({ commits: commits() }, "financial.accounts.render.mount");
  view.unmount();
});
