import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useConfirmPaymentViewModel from "../hooks/useConfirmPaymentViewModel";

setupPerf();

it("SHOULD open without any request", async () => {
  const view = await openScreen(useConfirmPaymentViewModel);

  expectWithinBudget(
    report("confirmPayment"),
    "financial.confirmPayment.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useConfirmPaymentViewModel);

  expectWithinBudget(
    { commits: commits() },
    "financial.confirmPayment.render.mount",
  );
  view.unmount();
});
