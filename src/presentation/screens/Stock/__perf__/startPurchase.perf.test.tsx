import "@tests/perf/mocks";
import { useLocalSearchParams } from "expo-router";

import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useStartPurchaseViewModel from "../modals/StartPurchaseModal/hooks/useStartPurchaseViewModel";

setupPerf();

// Spec 120: "Ir às compras".
it("SHOULD open within the request budget", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "list-1" });

  const view = await openScreen(useStartPurchaseViewModel);

  expectWithinBudget(report("startPurchase"), "stock.startPurchase.mount.cold");
  view.unmount();
});
