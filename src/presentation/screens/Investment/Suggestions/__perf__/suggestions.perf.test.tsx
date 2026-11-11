import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useSuggestionsViewModel from "../hooks/useSuggestionsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useSuggestionsViewModel);

  expectWithinBudget(
    report("suggestions"),
    "investment.suggestions.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useSuggestionsViewModel);

  expectWithinBudget(
    { commits: commits() },
    "investment.suggestions.render.mount",
  );
  view.unmount();
});
