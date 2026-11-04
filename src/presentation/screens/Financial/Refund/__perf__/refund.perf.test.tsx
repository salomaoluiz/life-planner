import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useRefundViewModel from "../hooks/useRefundViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useRefundViewModel);

  expectWithinBudget(report("refund"), "financial.refund.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useRefundViewModel);

  expectWithinBudget({ commits: commits() }, "financial.refund.render.mount");
  view.unmount();
});
