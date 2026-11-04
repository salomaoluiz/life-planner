import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useAddNewFamilyViewModel from "../modals/AddNewFamily/hooks/useAddNewFamilyViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useAddNewFamilyViewModel);

  expectWithinBudget(report("newFamily"), "family.newFamily.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useAddNewFamilyViewModel);

  expectWithinBudget({ commits: commits() }, "family.newFamily.render.mount");
  view.unmount();
});
