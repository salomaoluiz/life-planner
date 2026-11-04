import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useNewCreditCardViewModel from "../modals/NewCreditCardModal/hooks/useNewCreditCardViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useNewCreditCardViewModel);

  expectWithinBudget(
    report("newCreditCard"),
    "financial.newCreditCard.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useNewCreditCardViewModel);

  expectWithinBudget(
    { commits: commits() },
    "financial.newCreditCard.render.mount",
  );
  view.unmount();
});
