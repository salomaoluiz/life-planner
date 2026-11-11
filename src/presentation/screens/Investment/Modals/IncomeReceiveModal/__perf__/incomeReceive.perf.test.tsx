import "@tests/perf/mocks";
import { expectWithinBudget } from "@tests/perf/budgets";
import {
  countHookCommits,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import useIncomeReceiveModalViewModel from "../hooks/useIncomeReceiveModalViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useIncomeReceiveModalViewModel, {
    id: "income-1",
  });

  expectWithinBudget(
    report("incomeReceive"),
    "investment.incomeReceive.mount.cold",
  );
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(
    useIncomeReceiveModalViewModel,
    {
      id: "income-1",
    },
  );

  expectWithinBudget(
    { commits: commits() },
    "investment.incomeReceive.render.mount",
  );
  view.unmount();
});
