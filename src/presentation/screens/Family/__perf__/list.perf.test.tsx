import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useFamilyViewModel from "../hooks/useFamilyViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFamilyViewModel);

  expectWithinBudget(report("list"), "family.list.mount.cold");
  view.unmount();
});
