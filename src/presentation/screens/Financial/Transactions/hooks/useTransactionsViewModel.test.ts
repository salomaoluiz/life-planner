import { act } from "@tests";

import {
  dto,
  givenData,
  owners,
  setup,
  spies,
  summaryQuery,
  transactionsQuery,
  ui,
} from "./mocks/useTransactionsViewModel.mocks";
import { fetchSummary, fetchTransactions } from "./useTransactionsViewModel";

describe("fetchTransactions", () => {
  it("SHOULD load owners, transactions and categories and join the category to each row", async () => {
    spies.getOwners.mockResolvedValue([
      { id: "user-id", name: "Alice Test", type: "USER" },
    ] as never);
    spies.getTransactions.mockResolvedValue([
      dto("tx-1", new Date(2026, 9, 1)),
    ]);
    spies.getCategories.mockResolvedValue([]);

    const result = await fetchTransactions();

    expect(spies.getTransactions).toHaveBeenCalledWith({
      ownerIds: ["user-id"],
    });
    expect(spies.getCategories).toHaveBeenCalledWith(["user-id"]);
    expect(result.items[0].id).toBe("tx-1");
  });
});

describe("fetchSummary", () => {
  it("SHOULD call the 010 use case with month and owners", async () => {
    const month = new Date(2026, 9, 1);
    spies.getSummary.mockResolvedValue({ balance: 0, expense: 0, income: 0 });

    await fetchSummary(month, ["user-id"]);

    expect(spies.getSummary).toHaveBeenCalledWith({
      month,
      ownerIds: ["user-id"],
    });
  });
});

it("SHOULD default to the current month and list only its transactions grouped by day", () => {
  givenData([
    ui("this-month", new Date(2026, 9, 3)),
    ui("last-month", new Date(2026, 8, 30)),
  ]);

  const { result } = setup();

  expect(result.current.monthLabel).toBe("October 2026");
  expect(result.current.entries.map((e) => e.kind)).toEqual(["header", "item"]);
  expect(result.current.stickyIndices).toEqual([0]);
  expect(result.current.isEmptyMonth).toBe(false);
});

it("SHOULD move to the previous and next month (future months allowed)", () => {
  givenData([ui("sep", new Date(2026, 8, 30))]);
  const { result } = setup();

  act(() => result.current.onPreviousMonth());
  expect(result.current.monthLabel).toBe("September 2026");
  expect(result.current.entries).toHaveLength(2);

  act(() => result.current.onNextMonth());
  act(() => result.current.onNextMonth());
  expect(result.current.monthLabel).toBe("November 2026");
  expect(result.current.isEmptyMonth).toBe(true);
});

it("SHOULD select a month and year from the picker", () => {
  givenData([]);
  const { result } = setup();

  act(() => result.current.onMonthPickerOpen());
  expect(result.current.isMonthPickerOpen).toBe(true);
  act(() => result.current.onPickerYearChange(-1));
  act(() => result.current.onMonthSelect("2"));

  expect(result.current.monthLabel).toBe("March 2025");
  expect(result.current.isMonthPickerOpen).toBe(false);
});

function itemIds(entries: { key: string; kind: string }[]) {
  return entries.filter((e) => e.kind === "item").map((e) => e.key);
}

function items() {
  return [
    ui("exp", new Date(2026, 9, 1)),
    ui("inc", new Date(2026, 9, 2), "user-id", "INCOME"),
    ui("fam-exp", new Date(2026, 9, 3), "family-1"),
    ui("fam-inc", new Date(2026, 9, 4), "family-1", "INCOME"),
  ];
}

function lastSummaryKey() {
  return spies.useQuery.mock.calls
    .map((call) => call[0])
    .filter((o) => o.cacheKey[0] === "summary")
    .pop()!.cacheKey;
}

it("SHOULD combine owner and type filters, owner first", () => {
  givenData(items());
  const { result } = setup();

  act(() => result.current.onOwnerFilterChange("family-1"));
  act(() => result.current.onTypeFilterChange("EXPENSE"));

  expect(itemIds(result.current.entries)).toEqual(["item-fam-exp"]);
  expect(result.current.ownerFilter).toBe("family-1");
  expect(result.current.typeFilter).toBe("EXPENSE");
});

it("SHOULD filter by type alone and by owner alone", () => {
  givenData(items());
  const { result } = setup();

  act(() => result.current.onTypeFilterChange("INCOME"));
  expect(itemIds(result.current.entries)).toHaveLength(2);

  act(() => result.current.onTypeFilterChange("ALL"));
  act(() => result.current.onOwnerFilterChange("user-id"));
  expect(itemIds(result.current.entries)).toHaveLength(2);
});

it("SHOULD reset BOTH filters on clear", () => {
  givenData(items());
  const { result } = setup();
  act(() => result.current.onOwnerFilterChange("family-1"));
  act(() => result.current.onTypeFilterChange("INCOME"));

  act(() => result.current.onClearFilters());

  expect(result.current.ownerFilter).toBe("ALL");
  expect(result.current.typeFilter).toBe("ALL");
  expect(itemIds(result.current.entries)).toHaveLength(4);
});

it("SHOULD report a filtered empty state only WHEN the month has data but scope + type hide it", () => {
  givenData([ui("exp", new Date(2026, 9, 1))]);
  const { result } = setup();

  act(() => result.current.onTypeFilterChange("INCOME"));
  expect(result.current.isFilteredEmpty).toBe(true);
  expect(result.current.isEmptyMonth).toBe(false);

  act(() => result.current.onTypeFilterChange("ALL"));
  act(() => result.current.onOwnerFilterChange("family-1"));
  expect(result.current.isFilteredEmpty).toBe(true);
});

it("SHOULD keep both filters WHEN the month changes", () => {
  givenData(items());
  const { result } = setup();
  act(() => result.current.onOwnerFilterChange("family-1"));
  act(() => result.current.onTypeFilterChange("EXPENSE"));

  act(() => result.current.onPreviousMonth());

  expect(result.current.ownerFilter).toBe("family-1");
  expect(result.current.typeFilter).toBe("EXPENSE");
});

it("SHOULD build scope choices: All, Personal, families, and expose the personal owner id", () => {
  givenData([]);
  const { result } = setup();

  expect(result.current.scopeChoices.map((c) => c.value)).toEqual([
    "ALL",
    "user-id",
    "family-1",
  ]);
  expect(result.current.personalOwnerId).toBe("user-id");
  expect(result.current.monthName).toBe("October");
});

it("SHOULD summarize for the selected owner only and ignore the type filter", () => {
  givenData([]);
  const { result } = setup();

  act(() => result.current.onOwnerFilterChange("family-1"));
  act(() => result.current.onTypeFilterChange("EXPENSE"));

  expect(lastSummaryKey()).toEqual(["summary", "2026-9", "family-1"]);
});

it("SHOULD summarize every owner WHEN the scope is All", () => {
  givenData([]);
  setup();

  expect(lastSummaryKey()).toEqual([
    "summary",
    "2026-9",
    "user-id",
    "family-1",
  ]);
});

it("SHOULD fall back to All WHEN the selected family is no longer an owner", () => {
  givenData(items());
  const { rerender, result } = setup();
  act(() => result.current.onOwnerFilterChange("family-1"));

  transactionsQuery.withData({
    items: items(),
    owners: owners.filter((owner) => owner.id === "user-id"),
  });
  rerender({});

  expect(result.current.ownerFilter).toBe("ALL");
  expect(itemIds(result.current.entries)).toHaveLength(4);
  expect(lastSummaryKey()).toEqual(["summary", "2026-9", "user-id"]);
});

it("SHOULD render only the All scope WHEN the user has no personal owner or families", () => {
  transactionsQuery.withData({ items: [], owners: [] });
  summaryQuery.withData({ balance: 0, expense: 0, income: 0 });
  const { result } = setup();

  expect(result.current.scopeChoices.map((c) => c.value)).toEqual(["ALL"]);
  expect(result.current.personalOwnerId).toBeUndefined();
});

it("SHOULD expose the summary in cents and the loading and error states", () => {
  givenData([]);
  expect(setup().result.current.summary).toEqual({
    balanceCents: 4000,
    expenseCents: 1000,
    incomeCents: 5000,
  });

  transactionsQuery.reset().withIsFetching(true);
  expect(setup().result.current.isLoading).toBe(true);

  transactionsQuery.reset().withError();
  expect(setup().result.current.errorMessage).toBeDefined();

  givenData([]);
  summaryQuery.withError();
  expect(setup().result.current.summaryError).toBe(true);
});

it("SHOULD open the form to add and the edit sheet for a row", () => {
  givenData([]);
  const { result } = setup();

  result.current.onAddPress();
  expect(spies.push).toHaveBeenCalledWith({
    pathname: "/financial/transaction/add_new_transaction",
  });

  result.current.onRowPress("tx-1");
  expect(spies.push).toHaveBeenCalledWith({
    params: { id: "tx-1" },
    pathname: "/financial/transaction/add_new_transaction",
  });
});

it("SHOULD refetch WHEN the screen is focused", () => {
  givenData([]);
  spies.isFocused.mockReturnValue(true);

  setup();

  expect(transactionsQuery.value.refetch).toHaveBeenCalled();
});
