import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useAddNewFamilyMemberViewModel from "../modals/AddNewFamilyMember/hooks/useAddNewFamilyMemberViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useAddNewFamilyMemberViewModel);

  expectWithinBudget(report("newMember"), "familyMember.newMember.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useAddNewFamilyMemberViewModel,
  );

  expectWithinBudget(
    { commits: commits() },
    "familyMember.newMember.render.mount",
  );
  view.unmount();
});
