import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

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

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useEarlyPaymentViewModel);

  expectWithinBudget(
    { commits: commits() },
    "financial.earlyPayment.render.mount",
  );
  view.unmount();
});
