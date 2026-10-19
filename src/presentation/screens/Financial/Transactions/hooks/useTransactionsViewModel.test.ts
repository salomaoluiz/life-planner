import { act } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { makeInvoice } from "../mocks/invoice.mocks";
import TransactionUIModel from "../models/TransactionUIModel";
import {
  dto,
  givenData,
  invoicesQuery,
  owners,
  projectionsQuery,
  setup,
  spies,
  summaryQuery,
  transactionsQuery,
  ui,
} from "./mocks/useTransactionsViewModel.mocks";
import {
  fetchProjections,
  fetchSummary,
  fetchTransactions,
} from "./useTransactionsViewModel";

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
    spies.getSummary.mockResolvedValue({
      balance: 0,
      expense: 0,
      income: 0,
      projectedExpense: 0,
      projectedIncome: 0,
      toPay: 0,
      toReceive: 0,
    });

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
  summaryQuery.withData({
    balance: 0,
    expense: 0,
    income: 0,
    toPay: 0,
    toReceive: 0,
  });
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
    projectedExpenseCents: 0,
    projectedIncomeCents: 0,
    toPayCents: 700,
    toReceiveCents: 900,
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

describe("card invoices (spec 029)", () => {
  it("SHOULD NOT treat the month as empty WHEN it only has a card invoice", () => {
    givenData([]);
    invoicesQuery.withData([makeInvoice({ listDate: "2026-10-12" })]);

    const { result } = setup();

    expect(result.current.isEmptyMonth).toBe(false);
    expect(result.current.entries.map((entry) => entry.kind)).toEqual([
      "header",
      "invoice",
    ]);
  });

  it("SHOULD hide card purchases from the account rows", () => {
    const purchase = new TransactionUIModel(
      new TransactionDTO({
        ...dto("purchase", new Date(2026, 9, 3)),
        accountId: undefined,
        creditCardId: "card-1",
      }),
    );
    givenData([ui("tx-1", new Date(2026, 9, 2)), purchase]);

    expect(
      setup().result.current.entries.filter((e) => e.kind === "item"),
    ).toHaveLength(1);
  });

  it("SHOULD hide the invoice for the Income filter, show a filtered-empty state AND restore it", () => {
    givenData([]);
    invoicesQuery.withData([makeInvoice({ listDate: "2026-10-12" })]);
    const { result } = setup();

    act(() => result.current.onTypeFilterChange("INCOME"));

    expect(result.current.entries).toEqual([]);
    expect(result.current.isFilteredEmpty).toBe(true);

    act(() => result.current.onTypeFilterChange("ALL"));
    expect(result.current.entries).toHaveLength(2);
  });

  it("SHOULD keep the account rows AND flag the error WHEN the invoices request fails", () => {
    givenData([ui("tx-1", new Date(2026, 9, 2))]);
    invoicesQuery.withError();

    const { result } = setup();

    expect(result.current.invoicesError).toBe(true);
    expect(
      result.current.entries.filter((e) => e.kind === "item"),
    ).toHaveLength(1);
  });

  it("SHOULD expand one invoice at a time AND open the detail route", () => {
    givenData([]);
    const invoice = makeInvoice({ listDate: "2026-10-12" });
    invoicesQuery.withData([invoice]);
    const { result } = setup();

    act(() => result.current.onInvoiceToggle(invoice.id));
    expect(result.current.expandedInvoiceId).toBe(invoice.id);
    act(() => result.current.onInvoiceToggle(invoice.id));
    expect(result.current.expandedInvoiceId).toBeUndefined();

    act(() => result.current.onInvoiceOpen(invoice));
    expect(spies.push).toHaveBeenCalledWith({
      params: { cardId: "card-1", month: "2026-10" },
      pathname: "/financial/invoice/invoice_detail",
    });
  });
});

describe("projected occurrences (spec 034)", () => {
  function projectedDto(overrides = {}) {
    return new ProjectedOccurrenceDTO({
      accountId: "account-id",
      accountName: "Checking",
      category: "Food",
      categoryId: "cat-1",
      date: new Date(2026, 10, 5).toISOString(),
      description: "Rent",
      frequency: "MONTHLY",
      occurrenceCount: 12,
      occurrenceNumber: 2,
      owner: "USER",
      ownerId: "user-id",
      recurrenceId: "series-1",
      type: "EXPENSE",
      value: "2000.00",
      ...overrides,
    });
  }

  describe("fetchProjections", () => {
    it("SHOULD turn account occurrences into muted rows with their category AND group card ones by invoice", async () => {
      spies.getCategories.mockResolvedValue([
        new CategoryDTO({
          icon: "food",
          iconColor: "#F59E0B",
          id: "cat-1",
          name: "Food",
          owner: "USER",
          ownerId: "user-id",
          type: "EXPENSE",
        }),
      ]);
      spies.getProjections.mockResolvedValue([
        projectedDto(),
        projectedDto({
          creditCardColor: "#112233",
          creditCardId: "card-1",
          creditCardLastDigits: "1234",
          creditCardTitle: "Main card",
          invoiceListDate: "2026-12-10",
          invoiceMonth: "2026-11",
          occurrenceNumber: 2,
        }),
        projectedDto({
          creditCardId: "card-1",
          creditCardTitle: "Main card",
          invoiceListDate: "2026-12-10",
          invoiceMonth: "2026-11",
          occurrenceNumber: 3,
        }),
        // A card occurrence without its invoice day cannot be placed: it is left out.
        projectedDto({ creditCardId: "card-1" }),
      ]);

      const result = await fetchProjections("2026-11", "2026-12", ["user-id"]);

      expect(spies.getProjections).toHaveBeenCalledWith({
        from: "2026-11",
        ownerIds: ["user-id"],
        to: "2026-12",
      });
      expect(result.accountItems).toHaveLength(1);
      expect(result.accountItems[0]).toMatchObject({
        categoryIcon: "food",
        isProjected: true,
      });
      expect(result.cardGroups).toHaveLength(1);
      expect(result.cardGroups[0]).toMatchObject({
        card: {
          color: "#112233",
          id: "card-1",
          lastDigits: "1234",
          title: "Main card",
        },
        listDate: "2026-12-10",
        referenceMonth: "2026-11",
      });
      expect(result.cardGroups[0].items).toHaveLength(2);
    });

    it("SHOULD give a card without data neutral defaults", async () => {
      spies.getCategories.mockResolvedValue([]);
      spies.getProjections.mockResolvedValue([
        projectedDto({
          creditCardId: "card-1",
          invoiceListDate: "2026-12-10",
          invoiceMonth: "2026-11",
        }),
      ]);

      const result = await fetchProjections("2026-11", "2026-11", ["user-id"]);

      expect(result.cardGroups[0].card).toMatchObject({ color: "", title: "" });
    });
  });

  it("SHOULD show the projected rows of a month after the current one AND not in the current month", () => {
    givenData([]);
    projectionsQuery.withData({
      accountItems: [
        new TransactionUIModel(projectedDto().toTransactionDTO()),
        new TransactionUIModel(
          projectedDto({
            date: new Date(2026, 11, 5).toISOString(),
            occurrenceNumber: 3,
          }).toTransactionDTO(),
        ),
      ],
      cardGroups: [],
    });
    const { result } = setup();

    // October 2026 (current): projections are not part of it.
    expect(
      result.current.entries.filter((e) => e.kind === "item"),
    ).toHaveLength(0);

    act(() => result.current.onNextMonth());

    const items = result.current.entries.filter((e) => e.kind === "item");

    expect(items).toHaveLength(1);
    expect(result.current.isEmptyMonth).toBe(false);
  });

  it("SHOULD put the projected card purchases on the invoice of the month, carrying the real one", () => {
    givenData([]);
    invoicesQuery.withData([
      makeInvoice({ listDate: "2026-11-12", referenceMonth: "2026-10" }),
    ]);
    projectionsQuery.withData({
      accountItems: [],
      cardGroups: [
        {
          card: {
            color: "#2B3A8C",
            id: "card-1",
            lastDigits: "1234",
            owner: "USER" as never,
            ownerId: "user-id",
            title: "Main card",
          },
          items: [
            new TransactionUIModel(
              projectedDto({
                creditCardId: "card-1",
                invoiceListDate: "2026-11-12",
                invoiceMonth: "2026-10",
              }).toTransactionDTO(),
            ),
          ],
          listDate: "2026-11-12",
          referenceMonth: "2026-10",
        },
        {
          card: {
            color: "#2B3A8C",
            id: "card-1",
            owner: "USER" as never,
            ownerId: "user-id",
            title: "Main card",
          },
          items: [],
          listDate: "2026-12-12",
          referenceMonth: "2026-11",
        },
      ],
    });
    const { result } = setup();

    act(() => result.current.onNextMonth());

    const lines = result.current.entries.filter((e) => e.kind === "invoice");

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ invoice: { includesProjected: true } });
  });

  it("SHOULD open a projected occurrence by series, number and month", () => {
    givenData([]);
    const { result } = setup();
    const item = new TransactionUIModel(projectedDto().toTransactionDTO());

    act(() => result.current.onProjectedPress(item));

    expect(spies.push).toHaveBeenCalledWith({
      params: {
        month: "2026-11",
        occurrenceNumber: "2",
        recurrenceId: "series-1",
      },
      pathname: "/financial/transaction/add_new_transaction",
    });
  });

  it("SHOULD refetch the projections WHEN refreshing a future month, not the current one", () => {
    givenData([]);
    const { result } = setup();

    act(() => result.current.onRefresh());
    expect(projectionsQuery.value.refetch).not.toHaveBeenCalled();

    act(() => result.current.onNextMonth());
    act(() => result.current.onRefresh());
    expect(projectionsQuery.value.refetch).toHaveBeenCalled();
  });
});
