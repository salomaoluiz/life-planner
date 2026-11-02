import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useAccountsViewModel from "../hooks/useAccountsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useAccountsViewModel);

  expectWithinBudget(report("accounts"), "financial.accounts.mount.cold");
  view.unmount();
});
