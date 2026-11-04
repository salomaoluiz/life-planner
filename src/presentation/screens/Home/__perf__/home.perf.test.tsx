import "@tests/perf/mocks";
import { act } from "@tests";
import { expectWithinBudget } from "@tests/perf/budgets";
import { accountRow } from "@tests/perf/fixtures/finance";
import { USER_ID } from "@tests/perf/fixtures/user";
import * as network from "@tests/perf/networkHarness";
import {
  countHookCommits,
  flush,
  openScreen,
  report,
  setupPerf,
} from "@tests/perf/screen";

import { useCases } from "@application/useCases";
import runPendingChange from "@screens/Financial/Transactions/pending/runPendingChange";

import useHomeViewModel from "../hooks/useHomeViewModel";

setupPerf();

it("SHOULD open within the request budget", async () => {
  const view = await openScreen(useHomeViewModel);

  expectWithinBudget(report("home"), "home.home.mount.cold");
  view.unmount();
});

it("SHOULD mount within the render budget", async () => {
  const { commits, view } = await countHookCommits(useHomeViewModel);

  expectWithinBudget({ commits: commits() }, "home.home.render.mount");
  view.unmount();
});

// Spec 076: Home stays mounted behind the transactions screen; a write refreshes its finance blocks through the same
// targeted keys, never the whole screen.
it("SHOULD refresh only its finance blocks WHEN a transaction is created while mounted", async () => {
  const view = await openScreen(useHomeViewModel);

  network.mark();
  await act(async () => {
    const running = runPendingChange(
      { description: "Weekly groceries", kind: "create" },
      async () =>
        useCases.createFinancialTransactionUseCase.execute({
          accountId: accountRow.accountId,
          category: "Groceries",
          categoryId: accountRow.categoryId,
          date: new Date().toISOString(),
          description: "Weekly groceries",
          owner: "USER",
          ownerId: USER_ID,
          type: "EXPENSE",
          value: "10.00",
        } as never),
      jest.fn(),
    );

    await network.flush(async (callback) => callback());
    await running;
  });
  await flush();

  expectWithinBudget(report("home write"), "home.home.write.mounted");
  view.unmount();
});
