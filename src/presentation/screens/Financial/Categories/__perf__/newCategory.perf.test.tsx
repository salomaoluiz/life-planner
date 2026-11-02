import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useNewCategoryViewModel from "../modals/NewCategoryModal/hooks/useNewCategoryViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewCategoryViewModel);

  expectWithinBudget(report("newCategory"), "financial.newCategory.mount.cold");
  view.unmount();
});
