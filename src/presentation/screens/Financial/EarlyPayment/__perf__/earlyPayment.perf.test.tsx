import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useEarlyPaymentViewModel from "../hooks/useEarlyPaymentViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useEarlyPaymentViewModel);

  expectWithinBudget(
    report("earlyPayment"),
    "financial.earlyPayment.mount.cold",
  );
  view.unmount();
});
