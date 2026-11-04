import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useFamilyViewModel from "../hooks/useFamilyViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFamilyViewModel);

  expectWithinBudget(report("list"), "family.list.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useFamilyViewModel);

  expectWithinBudget({ commits: commits() }, "family.list.render.mount");
  view.unmount();
});
