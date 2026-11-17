import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useInvestmentSettingsViewModel from "../hooks/useInvestmentSettingsViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useInvestmentSettingsViewModel);

  expectWithinBudget(report("settings"), "investment.settings.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useInvestmentSettingsViewModel,
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.settings.render.mount",
  );
  view.unmount();
});
