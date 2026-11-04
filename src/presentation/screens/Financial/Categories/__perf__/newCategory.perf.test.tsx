import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useNewCategoryViewModel from "../modals/NewCategoryModal/hooks/useNewCategoryViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewCategoryViewModel);

  expectWithinBudget(report("newCategory"), "financial.newCategory.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useNewCategoryViewModel);

  expectWithinBudget(
    { commits: commits() },
    "financial.newCategory.render.mount",
  );
  view.unmount();
});
