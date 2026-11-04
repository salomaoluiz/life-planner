import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useVersionsViewModel from "../modals/Versions/hooks/useVersionsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useVersionsViewModel);

  expectWithinBudget(report("versions"), "configs.versions.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useVersionsViewModel);

  expectWithinBudget({ commits: commits() }, "configs.versions.render.mount");
  view.unmount();
});
