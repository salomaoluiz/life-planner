import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useCardsViewModel from "../hooks/useCardsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useCardsViewModel);

  expectWithinBudget(report("cards"), "financial.cards.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useCardsViewModel);

  expectWithinBudget({ commits: commits() }, "financial.cards.render.mount");
  view.unmount();
});
