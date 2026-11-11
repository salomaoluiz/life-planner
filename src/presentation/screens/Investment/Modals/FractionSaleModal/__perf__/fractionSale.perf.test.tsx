import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useFractionSaleModalViewModel from "../hooks/useFractionSaleModalViewModel";

setupPerf();

const params = { assetId: "asset-1", eventId: "event-1" };

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useFractionSaleModalViewModel, params);

  expectWithinBudget(
    report("fractionSale"),
    "investment.fractionSale.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useFractionSaleModalViewModel,
    params,
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.fractionSale.render.mount",
  );
  view.unmount();
});
