import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useConfirmProjectedViewModel from "../hooks/useConfirmProjectedViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useConfirmProjectedViewModel);

  expectWithinBudget(
    report("confirmProjected"),
    "financial.confirmProjected.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useConfirmProjectedViewModel,
  );

  expectWithinBudget(
    { commits: commits() },
    "financial.confirmProjected.render.mount",
  );
  view.unmount();
});
