import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useAddNewFamilyViewModel from "../modals/AddNewFamily/hooks/useAddNewFamilyViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useAddNewFamilyViewModel);

  expectWithinBudget(report("newFamily"), "family.newFamily.mount.cold");
  view.unmount();
});
