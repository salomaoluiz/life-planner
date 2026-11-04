import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useTagsViewModel from "../hooks/useTagsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useTagsViewModel);

  expectWithinBudget(report("tags"), "financial.tags.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useTagsViewModel);

  expectWithinBudget({ commits: commits() }, "financial.tags.render.mount");
  view.unmount();
});
