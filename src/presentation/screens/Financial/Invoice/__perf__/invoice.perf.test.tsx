import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useInvoiceViewModel from "../hooks/useInvoiceViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInvoiceViewModel, {
    cardId: "card-id",
    month: "2026-11",
  });

  expectWithinBudget(report("invoice"), "financial.invoice.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useInvoiceViewModel, {
    cardId: "card-id",
    month: "2026-11",
  });

  expectWithinBudget({ commits: commits() }, "financial.invoice.render.mount");
  view.unmount();
});
