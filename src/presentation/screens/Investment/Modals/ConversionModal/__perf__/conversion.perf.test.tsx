import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useConversionModalViewModel from "../hooks/useConversionModalViewModel";

setupPerf();

const params = { assetId: "asset-1" };

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useConversionModalViewModel, params);

  expectWithinBudget(report("conversion"), "investment.conversion.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useConversionModalViewModel,
    params,
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.conversion.render.mount",
  );
  view.unmount();
});
