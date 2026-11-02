import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useNewTagViewModel from "../modals/NewTagModal/hooks/useNewTagViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewTagViewModel);

  expectWithinBudget(report("newTag"), "financial.newTag.mount.cold");
  view.unmount();
});
