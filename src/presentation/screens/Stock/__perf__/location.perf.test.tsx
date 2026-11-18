import "@tests/perf/mocks";
import { useLocalSearchParams } from "expo-router";

import { expectWithinBudget } from "@tests/perf/budgets";
import { openScreen, report, setupPerf } from "@tests/perf/screen";

import useStockViewModel from "../hooks/useStockViewModel";

setupPerf();

// Spec 117 FR 20: the QR route is the stock list filtered by one location (plus the location header).
it("SHOULD open the location route within the request budget", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "location-1" });

  const view = await openScreen(useStockViewModel);

  expectWithinBudget(report("location"), "stock.location.mount.cold");
  view.unmount();
});
