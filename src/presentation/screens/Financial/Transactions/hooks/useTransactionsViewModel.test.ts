import { act } from "@tests";

import {
  dto,
  givenData,
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

it("SHOULD filter by type and by owner, and clear the filters", () => {
  givenData([
    ui("exp", new Date(2026, 9, 1)),
    ui("inc", new Date(2026, 9, 2), "user-id", "INCOME"),
    ui("fam", new Date(2026, 9, 3), "family-1"),
  ]);
  const { result } = setup();

  act(() => result.current.onFilterChange("INCOME"));
  expect(result.current.entries.filter((e) => e.kind === "item")).toHaveLength(
    1,
  );

  act(() => result.current.onFilterChange("OWNER:family-1"));
  expect(result.current.entries.filter((e) => e.kind === "item")).toHaveLength(
    1,
  );

  act(() => result.current.onClearFilters());
  expect(result.current.filter).toBe("ALL");
  expect(result.current.entries.filter((e) => e.kind === "item")).toHaveLength(
    3,
  );
});

it("SHOULD report a filtered empty state only WHEN the month has data but the filter hides it", () => {
  givenData([ui("exp", new Date(2026, 9, 1))]);
  const { result } = setup();

  act(() => result.current.onFilterChange("INCOME"));

  expect(result.current.isFilteredEmpty).toBe(true);
  expect(result.current.isEmptyMonth).toBe(false);
});

it("SHOULD build filter choices: All, Expenses, Income, Personal, families", () => {
  givenData([]);
  const { result } = setup();

  expect(result.current.filterChoices.map((c) => c.value)).toEqual([
    "ALL",
    "EXPENSE",
    "INCOME",
    "OWNER:user-id",
    "OWNER:family-1",
  ]);
});

it("SHOULD summarize for the owner of the owner filter only", () => {
  givenData([]);
  const { result } = setup();

  act(() => result.current.onFilterChange("OWNER:family-1"));

  const options = spies.useQuery.mock.calls
    .map((call) => call[0])
    .filter((o) => o.cacheKey[0] === "summary")
    .pop()!;
  expect(options.cacheKey).toContain("family-1");
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
