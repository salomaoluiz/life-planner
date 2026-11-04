import "@tests/perf/mocks";

import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";

import { act } from "@tests";
import { expectWithinBudget } from "@tests/perf/budgets";
import { accountRow } from "@tests/perf/fixtures/finance";
import { USER_ID } from "@tests/perf/fixtures/user";
import * as network from "@tests/perf/networkHarness";
import { flush, openScreen, report, setupPerf } from "@tests/perf/screen";

import { useCases } from "@application/useCases";

import useTransactionsViewModel from "../hooks/useTransactionsViewModel";
import useNewTransactionViewModel from "../modals/NewTransactionModal/hooks/useNewTransactionViewModel";
import runPendingChange from "../pending/runPendingChange";

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
