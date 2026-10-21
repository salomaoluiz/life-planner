import { act } from "@tests";

import { makeInvoice } from "../mocks/invoice.mocks";
import { EMPTY_FILTERS } from "../models/transactionFilters";
import {
  filteredInvoicesQuery,
  filteredProjectionsQuery,
  filteredTransactionsQuery,
  givenData,
  setup,
  spies,
  ui,
} from "./mocks/useTransactionsViewModel.mocks";
import {
  fetchFilteredTransactions,
  fetchProjections,
} from "./useTransactionsViewModel";

function lastQuery(prefix: string, filtered: boolean) {
  const calls = spies.useQuery.mock.calls.filter(([options]) => {
    const key = (options as { cacheKey: string[] }).cacheKey;

    return key[0] === prefix && key.includes("filtered") === filtered;
  });

  return calls[calls.length - 1][0] as { enabled?: boolean };
}

describe("fetchFilteredTransactions / fetchProjections with a filter", () => {
  it("SHOULD ask the filtered use case and join the categories", async () => {
    spies.getFilteredTransactions.mockResolvedValue([
      { categoryId: "cat-1", date: "2026-10-01T00:00:00.000Z", id: "t1" },
    ] as never);
    spies.getCategories.mockResolvedValue([]);

    const result = await fetchFilteredTransactions(["user-id"], {
      categoryIds: ["cat-1"],
    });

    expect(spies.getFilteredTransactions).toHaveBeenCalledWith({
      filter: { categoryIds: ["cat-1"] },
      ownerIds: ["user-id"],
    });
    expect(result).toHaveLength(1);
  });

  it("SHOULD pass the filter to the projections", async () => {
    spies.getProjections.mockResolvedValue([]);
    spies.getCategories.mockResolvedValue([]);

    await fetchProjections("2026-11", "2026-12", ["user-id"], { q: "gym" });

    expect(spies.getProjections).toHaveBeenCalledWith({
      filter: { q: "gym" },
      from: "2026-11",
      ownerIds: ["user-id"],
      to: "2026-12",
    });
  });
});

describe("without filters", () => {
  it("SHOULD keep the filtered queries off and the plain month list", () => {
    givenData([ui("plain", new Date(2026, 9, 3))]);

    const { result } = setup();

    expect(result.current.filtering).toBe(false);
    expect(result.current.filterCount).toBe(0);
    expect(lastQuery("filteredTransactions", false).enabled).toBe(false);
    expect(result.current.entries.map((e) => e.kind)).toEqual([
      "header",
      "item",
    ]);
  });
});

describe("with filters", () => {
  const categoryFilter = { ...EMPTY_FILTERS, categoryIds: ["cat-1"] };

  it("SHOULD list the filtered rows, summarize them and hide the plain month rows", () => {
    givenData([ui("plain", new Date(2026, 9, 3))]);
    filteredTransactionsQuery.withData([
      ui("match", new Date(2026, 9, 4), "user-id", "EXPENSE", "30.00"),
      ui("income", new Date(2026, 9, 5), "user-id", "INCOME", "100.00"),
    ]);
    filteredInvoicesQuery.withData([makeInvoice()]);

    const { result } = setup();

    act(() => result.current.onFiltersApply(categoryFilter));

    expect(result.current.filtering).toBe(true);
    expect(result.current.filterCount).toBe(1);
    expect(
      result.current.entries
        .filter((e) => e.kind === "item")
        .map((e) => (e.kind === "item" ? e.item.id : "")),
    ).toEqual(["income", "match"]);
    expect(result.current.entries.some((e) => e.kind === "invoice")).toBe(true);
    expect(result.current.filteredSummary).toMatchObject({
      expenseCents: 3000 + 45000,
      incomeCents: 10000,
    });
    expect(result.current.balances.size).toBe(0);
    expect(result.current.isEmptyMonth).toBe(false);
  });

  it("SHOULD use the period instead of the month and say so", () => {
    givenData([]);

    const { result } = setup();

    act(() =>
      result.current.onFiltersApply({
        ...EMPTY_FILTERS,
        period: { from: "2025-01-01", to: "2025-06-30" },
      }),
    );

    expect(result.current.hasPeriod).toBe(true);
    const key = (
      spies.useQuery.mock.calls
        .map(([options]) => options as { cacheKey: string[] })
        .filter((options) => options.cacheKey[0] === "filteredTransactions")
        .pop() as { cacheKey: string[] }
    ).cacheKey.join("|");

    expect(key).toContain("2025-01-01");
    expect(key).toContain("2025-06-30");
  });

  it("SHOULD skip the invoices when only accounts are chosen, and the rows when origin is Card", () => {
    givenData([]);

    const { result } = setup();

    act(() =>
      result.current.onFiltersApply({ ...EMPTY_FILTERS, accountIds: ["a1"] }),
    );
    expect(lastQuery("cardInvoices", true).enabled).toBe(false);
    expect(lastQuery("filteredTransactions", false).enabled).toBe(true);

    act(() =>
      result.current.onFiltersApply({ ...EMPTY_FILTERS, origin: "CARD" }),
    );
    expect(lastQuery("filteredTransactions", false).enabled).toBe(false);
    expect(lastQuery("cardInvoices", true).enabled).toBe(true);
  });

  it("SHOULD not ask for projections of paid rows", () => {
    givenData([]);

    const { result } = setup();

    act(() =>
      result.current.onFiltersApply({ ...EMPTY_FILTERS, situation: "PAID" }),
    );

    expect(lastQuery("projections", true).enabled).toBe(false);
  });

  it("SHOULD show the filtered empty state when nothing matches, and clear everything", () => {
    givenData([ui("plain", new Date(2026, 9, 3))]);
    filteredTransactionsQuery.withData([]);
    filteredInvoicesQuery.withData([]);
    filteredProjectionsQuery.withData({ accountItems: [], cardGroups: [] });

    const { result } = setup();

    act(() => result.current.onFiltersApply(categoryFilter));
    expect(result.current.filtersEmpty).toBe(true);
    expect(result.current.isEmptyMonth).toBe(false);

    act(() => result.current.onClearFilters());
    expect(result.current.filtering).toBe(false);
    expect(result.current.filters).toEqual(EMPTY_FILTERS);
  });

  it("SHOULD apply the search 300 ms after typing and remove a group by its chip", () => {
    givenData([]);

    const { result } = setup();

    act(() => result.current.onSearchChange("mercado"));
    expect(result.current.filtering).toBe(false);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.filtering).toBe(true);

    act(() => result.current.onFiltersApply({ ...categoryFilter, search: "" }));
    act(() => result.current.onFilterRemove("categories"));
    expect(result.current.filtering).toBe(false);
  });
});
