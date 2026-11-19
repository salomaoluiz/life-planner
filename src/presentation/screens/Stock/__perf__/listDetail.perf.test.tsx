import "@tests/perf/mocks";
import { useLocalSearchParams } from "expo-router";

import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useStockListDetailViewModel from "../ListDetail/hooks/useStockListDetailViewModel";

setupPerf();

// Spec 118: one shopping list.
it("SHOULD open within the request budget", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "list-1" });

  const view = await openScreen(useStockListDetailViewModel);

  expectWithinBudget(report("listDetail"), "stock.listDetail.mount.cold");
  view.unmount();
});
