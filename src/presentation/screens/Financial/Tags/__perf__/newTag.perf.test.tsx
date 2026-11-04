import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useNewTagViewModel from "../modals/NewTagModal/hooks/useNewTagViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewTagViewModel);

  expectWithinBudget(report("newTag"), "financial.newTag.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useNewTagViewModel);

  expectWithinBudget({ commits: commits() }, "financial.newTag.render.mount");
  view.unmount();
});
