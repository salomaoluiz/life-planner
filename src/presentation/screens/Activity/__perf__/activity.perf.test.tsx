import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useActivityViewModel from "../hooks/useActivityViewModel";
import useBatchViewModel from "../modals/BatchModal/hooks/useBatchViewModel";

setupPerf();

// Spec 127: the history of Finance (the Investments route mounts the same screen) and its batch detail.
it("SHOULD open the history within the request budget", async () => {
  const view = await openScreen(useActivityViewModel);

  expectWithinBudget(
    report("activity"),
    "activity.financialHistory.mount.cold",
  );
  expectWithinBudget(
    report("activity"),
    "activity.investmentHistory.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount the history within the render budget", async () => {
  const { commits, view } = await countHookCommits(useActivityViewModel);

  expectWithinBudget({ commits: commits() }, "activity.history.render.mount");
  view.unmount();
});

it("SHOULD open the batch detail within the request budget", async () => {
  const view = await openScreen(useBatchViewModel);

  expectWithinBudget(report("activity-batch"), "activity.batch.mount.cold");
  view.unmount();
});
