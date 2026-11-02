import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useTagsViewModel from "../hooks/useTagsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useTagsViewModel);

  expectWithinBudget(report("tags"), "financial.tags.mount.cold");
  view.unmount();
});
