import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useSectionPickerViewModel from "../hooks/useSectionPickerViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useSectionPickerViewModel);

  expectWithinBudget(
    report("sectionPicker"),
    "financial.sectionPicker.mount.cold",
  );
  view.unmount();
});
