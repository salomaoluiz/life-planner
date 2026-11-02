import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import usePrepaymentViewModel from "../hooks/usePrepaymentViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(usePrepaymentViewModel, { planId: "plan-id" });

  expectWithinBudget(report("prepayment"), "financial.prepayment.mount.cold");
  view.unmount();
});
