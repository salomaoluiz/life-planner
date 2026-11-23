import "@tests/perf/mocks";
import { useLocalSearchParams } from "expo-router";

import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import usePurchaseViewModel from "../Purchase/hooks/usePurchaseViewModel";

setupPerf();

// Spec 120: the shopping mode of one purchase.
it("SHOULD open within the request budget", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "purchase-1" });

  const view = await openScreen(usePurchaseViewModel);

  expectWithinBudget(report("purchase"), "stock.purchase.mount.cold");
  view.unmount();
});
