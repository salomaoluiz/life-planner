import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useNewAccountViewModel from "../modals/NewAccountModal/hooks/useNewAccountViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewAccountViewModel);

  expectWithinBudget(report("newAccount"), "financial.newAccount.mount.cold");
  view.unmount();
});
