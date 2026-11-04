import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useCategoriesViewModel from "../hooks/useCategoriesViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useCategoriesViewModel);

  expectWithinBudget(report("categories"), "financial.categories.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useCategoriesViewModel);

  expectWithinBudget(
    { commits: commits() },
    "financial.categories.render.mount",
  );
  view.unmount();
});
