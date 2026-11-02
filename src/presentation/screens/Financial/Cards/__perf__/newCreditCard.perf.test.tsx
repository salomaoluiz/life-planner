import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

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
