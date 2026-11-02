import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useHomeViewModel from "../hooks/useHomeViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useHomeViewModel);

  expectWithinBudget(report("home"), "home.home.mount.cold");
  view.unmount();
});
