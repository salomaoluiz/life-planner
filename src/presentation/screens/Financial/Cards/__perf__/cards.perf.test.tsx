import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useCardsViewModel from "../hooks/useCardsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useCardsViewModel);

  expectWithinBudget(report("cards"), "financial.cards.mount.cold");
  view.unmount();
});
