import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useRefundViewModel from "../hooks/useRefundViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useRefundViewModel);

  expectWithinBudget(report("refund"), "financial.refund.mount.cold");
  view.unmount();
});
