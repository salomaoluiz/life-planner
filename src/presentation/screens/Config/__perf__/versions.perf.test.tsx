import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useVersionsViewModel from "../modals/Versions/hooks/useVersionsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useVersionsViewModel);

  expectWithinBudget(report("versions"), "configs.versions.mount.cold");
  view.unmount();
});
