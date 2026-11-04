import "@tests/perf/mocks";
import "@shopify/flash-list/jestSetup";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";

import { act, fireEvent, screen } from "@tests";
import { expectWithinBudget } from "@tests/perf/budgets";
import { accountRow, invoiceRow } from "@tests/perf/fixtures/finance";
import { USER_ID } from "@tests/perf/fixtures/user";
import * as network from "@tests/perf/networkHarness";
import { countCommits } from "@tests/perf/renderBudget";
import respond from "@tests/perf/respond";
import {
  flush,
  openScreen,
  report,
  setupPerf,
  wrapper,
} from "@tests/perf/screen";

import { useCases } from "@application/useCases";

import { PREFETCH_IDLE_MS } from "../hooks/usePrefetchAdjacentMonths";
import useTransactionsViewModel from "../hooks/useTransactionsViewModel";
import FinancialTransactions from "../index";
import useNewTransactionViewModel from "../modals/NewTransactionModal/hooks/useNewTransactionViewModel";
import runPendingChange from "../pending/runPendingChange";
import transactionsTestIds from "../testIds";

setupPerf();

it("SHOULD open the screen cold within the request budget", async () => {
  const view = await openScreen(useTransactionsViewModel);

  expect(view.result.current.isLoading).toBe(false);
  expectWithinBudget(report("cold open"), "financial.transactions.mount.cold");
  view.unmount();
});

it("SHOULD send little WHEN the screen regains focus right after loading", async () => {
  const view = await openScreen(useTransactionsViewModel);

  network.mark();
  jest.mocked(useIsFocused).mockReturnValue(false);
  view.rerender({});
  jest.mocked(useIsFocused).mockReturnValue(true);
  view.rerender({});
  await flush();

  expectWithinBudget(
    report("focus return"),
    "financial.transactions.focusReturn",
  );
  view.unmount();
});

it("SHOULD load another month within the request budget", async () => {
  const view = await openScreen(useTransactionsViewModel);

  network.mark();
  act(() => view.result.current.onPreviousMonth());
  await flush();

  expectWithinBudget(
    report("month switch"),
    "financial.transactions.monthSwitch",
  );
  view.unmount();
});

describe("month prefetch (spec 087)", () => {
  async function openIdle() {
    const view = await openScreen(useTransactionsViewModel);

    network.mark();
    await new Promise((resolve) => setTimeout(resolve, PREFETCH_IDLE_MS + 200));
    await flush();

    return view;
  }

  it("SHOULD fetch only the two neighbouring months once idle", async () => {
    const view = await openIdle();

    expectWithinBudget(
      report("mount idle"),
      "financial.transactions.mount.idle",
    );
    view.unmount();
  });

  it("SHOULD switch to a prefetched month with its rows at once, revalidating in the background", async () => {
    const view = await openIdle();

    network.mark();
    act(() => view.result.current.onPreviousMonth());

    expect(view.result.current.isLoading).toBe(false);
    await flush();
    expectWithinBudget(
      report("month switch prefetched"),
      "financial.transactions.monthSwitch.prefetched",
    );
    view.unmount();
  });
});

describe("modals", () => {
  async function openModal(params: Record<string, string>, label: string) {
    const screen = await openScreen(useTransactionsViewModel);

    network.mark();
    jest.mocked(useLocalSearchParams).mockReturnValue(params);
    const modal = await openScreen(useNewTransactionViewModel);
    const result = report(label);

    modal.unmount();
    screen.unmount();

    return result;
  }

  it("SHOULD open a row for editing within the request budget", async () => {
    expectWithinBudget(
      await openModal({ id: accountRow.id }, "edit modal open"),
      "financial.transactions.modal.openEdit",
    );
  });

  it("SHOULD read the row with exactly one by-id request WHEN it is opened from elsewhere (Home, an invoice)", async () => {
    const modal = await openScreen(useNewTransactionViewModel, {
      id: accountRow.id,
    });
    const transactionReads = network
      .requests()
      .filter((request) => request.startsWith("GET /v1/finance/transactions"));

    expect(
      transactionReads.filter((request) =>
        request.includes(`/transactions/${accountRow.id}?today=`),
      ),
    ).toHaveLength(1);
    // The rest are the bounded reads of the category chips (a period each), never a list of the history.
    transactionReads
      .filter((request) => !request.includes(`/transactions/${accountRow.id}`))
      .forEach((request) => expect(request).toContain("from="));
    modal.unmount();
  });

  it("SHOULD open the create form within the request budget", async () => {
    expectWithinBudget(
      await openModal({}, "create modal open"),
      "financial.transactions.modal.openCreate",
    );
  });
});

describe("writes", () => {
  async function write(
    execute: () => Promise<unknown>,
    label: string,
    change: Parameters<typeof runPendingChange>[0] = {
      description: "Weekly groceries",
      kind: "edit",
    },
  ) {
    const view = await openScreen(useTransactionsViewModel);

    network.mark();
    await act(async () => {
      const running = runPendingChange(
        change,
        async () => {
          await execute();
        },
        jest.fn(),
      );

      await network.flush(async (callback) => callback());
      await running;
    });
    await flush();

    const result = report(label);

    view.unmount();

    return result;
  }

  it("SHOULD create within the request budget", async () => {
    const result = await write(
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
      "create",
    );

    expectWithinBudget(result, "financial.transactions.write.create");
  });

  it("SHOULD edit within the request budget", async () => {
    const result = await write(
      async () =>
        useCases.updateFinancialTransactionUseCase.execute({
          id: accountRow.id,
          ownerId: USER_ID,
          value: "11.00",
        } as never),
      "edit",
    );

    expectWithinBudget(result, "financial.transactions.write.edit");
  });

  it("SHOULD delete within the request budget", async () => {
    const result = await write(
      async () =>
        useCases.deleteFinancialTransactionUseCase.execute({
          id: accountRow.id,
          ownerId: USER_ID,
        } as never),
      "delete",
      {
        description: "Weekly groceries",
        kind: "delete",
        target: { transactionId: accountRow.id },
      },
    );

    expectWithinBudget(result, "financial.transactions.write.delete");
  });
});

describe("render commits", () => {
  async function mountScreen() {
    return countCommits(<FinancialTransactions />, {
      settle: flush,
      wrapper: wrapper as never,
    });
  }

  it("SHOULD mount within the render budget", async () => {
    const { commits, view } = await mountScreen();

    expectWithinBudget(
      { commits: commits() },
      "financial.transactions.render.mount",
    );
    view.unmount();
  });

  it("SHOULD create a row within the render budget", async () => {
    const { commits, mark, view } = await mountScreen();

    mark();
    await act(async () => {
      const running = runPendingChange(
        { description: "Weekly groceries", kind: "create" },
        async () => {
          await useCases.createFinancialTransactionUseCase.execute({
            accountId: accountRow.accountId,
            category: "Groceries",
            categoryId: accountRow.categoryId,
            date: new Date().toISOString(),
            description: "Weekly groceries",
            owner: "USER",
            ownerId: USER_ID,
            type: "EXPENSE",
            value: "10.00",
          } as never);
        },
        jest.fn(),
      );

      await network.flush(async (callback) => callback());
      await running;
    });
    await flush();

    expectWithinBudget(
      { commits: commits() },
      "financial.transactions.render.create",
    );
    view.unmount();
  });

  it("SHOULD expand an invoice within the render budget", async () => {
    network.reset((method, path) => {
      const body = respond(method, path) as Record<string, unknown>;

      return path.startsWith("/v1/finance/month")
        ? { ...body, invoices: [invoiceRow] }
        : body;
    });
    const { commits, mark, view } = await mountScreen();

    mark();
    fireEvent.press(screen.getByTestId(transactionsTestIds.cardInvoiceToggle));
    await flush();

    expectWithinBudget(
      { commits: commits() },
      "financial.transactions.render.expandInvoice",
    );
    view.unmount();
  });
});
