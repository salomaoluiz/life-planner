import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useIndexHistoryViewModel from "../hooks/useIndexHistoryViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useIndexHistoryViewModel, { index: "CDI" });

  expectWithinBudget(
    report("indexHistory"),
    "investment.indexHistory.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useIndexHistoryViewModel, {
    index: "CDI",
  });

  expectWithinBudget(
    { commits: commits() },
    "investment.indexHistory.render.mount",
  );
  view.unmount();
});
