import { router, useLocalSearchParams } from "expo-router";
import React from "react";

import { renderHook, waitFor } from "@tests";

import { useCases } from "@application/useCases";
import {
  queryClient,
  ReactQueryProvider,
} from "@infrastructure/fetcher/reactQuery";

import useAccountsViewModel from "../Accounts/hooks/useAccountsViewModel";
import useNewAccountViewModel from "../Accounts/modals/NewAccountModal/hooks/useNewAccountViewModel";
import useCategoriesViewModel from "../Categories/hooks/useCategoriesViewModel";
import useNewCategoryViewModel from "../Categories/modals/NewCategoryModal/hooks/useNewCategoryViewModel";
import useTransactionsViewModel from "../Transactions/hooks/useTransactionsViewModel";

// The global setup auto-mocks react-query; this test needs the real cache.
jest.unmock("@tanstack/react-query");
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: () => false }));
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => {
  const names = [
    "createFinancialAccountUseCase",
    "createFinancialCategoryUseCase",
    "deleteFinancialAccountUseCase",
    "deleteFinancialCategoryUseCase",
    "getFinancialAccountsUseCase",
    "getFinancialCategoriesUseCase",
    "getFinancialTransactionsUseCase",
    "getMonthSummaryUseCase",
    "getOwnersUseCase",
    "updateFinancialAccountUseCase",
    "updateFinancialCategoryUseCase",
  ];

  return {
    useCases: Object.fromEntries(
      names.map((name) => [name, { execute: jest.fn(), uniqueName: name }]),
    ),
  };
});

const owner = { id: "user-id", name: "Alice Test", type: "USER" };
const category = {
  icon: "food",
  iconColor: "#F59E0B",
  id: "food",
  name: "Food",
  owner: "USER",
  ownerId: "user-id",
  type: "EXPENSE",
};
const account = {
  balance: 0,
  icon: "bank",
  id: "acc-1",
  name: "Bank",
  owner: "USER",
  ownerId: "user-id",
  status: "ACTIVE",
};

function mocked(execute: unknown) {
  return execute as jest.Mock;
}

function wrapper({ children }: { children: React.ReactElement }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}

beforeEach(() => {
  queryClient.clear();
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({});
  mocked(useCases.getOwnersUseCase.execute).mockResolvedValue([owner]);
  mocked(useCases.getFinancialCategoriesUseCase.execute).mockResolvedValue([
    category,
  ]);
  mocked(useCases.getFinancialAccountsUseCase.execute).mockResolvedValue([
    account,
  ]);
  mocked(useCases.getFinancialTransactionsUseCase.execute).mockResolvedValue(
    [],
  );
  mocked(useCases.getMonthSummaryUseCase.execute).mockResolvedValue({
    balanceCents: 0,
    expenseCents: 0,
    incomeCents: 0,
  });
  void router;
});

async function settle() {
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));
}

describe.each([["list then form"], ["form then list"]])("%s", (order) => {
  it("SHOULD not crash the category form and list sharing the cache", async () => {
    const listFirst = order === "list then form";
    const list = renderHook(() => useCategoriesViewModel(), {
      wrapper,
    });
    if (!listFirst) {
      list.unmount();
    }
    await settle();
    const form = renderHook(() => useNewCategoryViewModel(), { wrapper });
    await settle();
    const listAgain = renderHook(() => useCategoriesViewModel(), { wrapper });
    await settle();

    await waitFor(() => expect(form.result.current.isLoading).toBe(false));
    await waitFor(() => expect(listAgain.result.current.rows).toHaveLength(1));
  });

  it("SHOULD not crash the account form and list sharing the cache", async () => {
    const list = renderHook(() => useAccountsViewModel(), { wrapper });
    if (order !== "list then form") {
      list.unmount();
    }
    await settle();
    const form = renderHook(() => useNewAccountViewModel(), { wrapper });
    await settle();
    const listAgain = renderHook(() => useAccountsViewModel(), { wrapper });
    await settle();

    await waitFor(() => expect(form.result.current.isLoading).toBe(false));
    await waitFor(() =>
      expect(listAgain.result.current.entries.length).toBeGreaterThan(0),
    );
  });
});

it("SHOULD not crash the category edit form WHEN the transactions list cache is filled", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "food" });
  renderHook(() => useTransactionsViewModel(), { wrapper });
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  const form = renderHook(() => useNewCategoryViewModel(), { wrapper });
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));

  await waitFor(() => expect(form.result.current.isLoading).toBe(false));
});
