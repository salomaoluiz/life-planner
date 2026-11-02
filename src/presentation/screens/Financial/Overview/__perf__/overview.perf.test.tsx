import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useOverviewViewModel from "../hooks/useOverviewViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useOverviewViewModel);

  expectWithinBudget(report("overview"), "financial.overview.mount.cold");
  view.unmount();
});
