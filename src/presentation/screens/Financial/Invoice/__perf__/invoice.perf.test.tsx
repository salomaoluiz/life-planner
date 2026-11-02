import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

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
