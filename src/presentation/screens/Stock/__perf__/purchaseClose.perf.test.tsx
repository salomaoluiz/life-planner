import "@tests/perf/mocks";
import { useLocalSearchParams } from "expo-router";

import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import usePurchaseCloseViewModel from "../PurchaseClose/hooks/usePurchaseCloseViewModel";

setupPerf();

// Spec 120: the closing wizard.
it("SHOULD open within the request budget", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "purchase-1" });

  const view = await openScreen(usePurchaseCloseViewModel);

  expectWithinBudget(report("purchaseClose"), "stock.purchaseClose.mount.cold");
  view.unmount();
});
