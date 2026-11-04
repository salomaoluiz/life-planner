import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

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

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useSectionPickerViewModel);

  expectWithinBudget(
    { commits: commits() },
    "financial.sectionPicker.render.mount",
  );
  view.unmount();
});
