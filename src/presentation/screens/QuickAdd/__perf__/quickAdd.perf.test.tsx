import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useQuickAddViewModel from "../hooks/useQuickAddViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useQuickAddViewModel);

  expectWithinBudget(report("quickAdd"), "home.quickAdd.mount.cold");
  view.unmount();
});
