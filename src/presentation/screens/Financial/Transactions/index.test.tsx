import { fireEvent, screen, within } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { hasText } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { makeTransactionDTO } from "./mocks/index.mocks";
import { makeInvoice } from "./mocks/invoice.mocks";
import { makeEntries, setup } from "./mocks/screen.mocks";
import { EMPTY_FILTERS } from "./models/transactionFilters";
import { ListEntry } from "./models/transactionList";
import TransactionUIModel from "./models/TransactionUIModel";

it("SHOULD render skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("transactions-skeleton")).toHaveLength(6);
});

it("SHOULD render ErrorState with a retry that calls onRetry", () => {
  const onRetry = jest.fn();
  setup({ errorMessage: "boom", onRetry });

  expect(hasText("boom")).toBe(true);
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty month state with the month in the title and an add button", () => {
  const onAddPress = jest.fn();
  setup({
    entries: [],
    isEmptyMonth: true,
    monthLabel: "October 2026",
    onAddPress,
  });

  expect(screen.getByTestId(transactionsTestIds.emptyMonth)).toBeOnTheScreen();
  expect(
    hasText('financial.transactions.emptyTitle {"month":"October 2026"}'),
  ).toBe(true);
  fireEvent.press(screen.getByText("financial.transactions.add"));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render the filtered empty state and clear filters", () => {
  const onClearFilters = jest.fn();
  setup({ entries: [], isFilteredEmpty: true, onClearFilters });

  expect(hasText("financial.transactions.noMatch")).toBe(true);
  fireEvent.press(screen.getByText("financial.common.clearFilters"));
  expect(onClearFilters).toHaveBeenCalledTimes(1);
});

it("SHOULD render the day header with Today and the rows", () => {
  setup({ entries: makeEntries(), stickyIndices: [0] });

  expect(screen.getByTestId(transactionsTestIds.screen)).toBeOnTheScreen();
  expect(hasText("financial.transactions.today")).toBe(true);
  expect(screen.getAllByTestId(transactionsTestIds.row)).toHaveLength(2);
});

it("SHOULD pass the day header indices to the list as sticky", () => {
  setup({ entries: makeEntries(), stickyIndices: [0] });

  expect(screen.getByTestId("flashList").props.stickyHeaderIndices).toEqual([
    0,
  ]);
});

it("SHOULD call onRowPress with the transaction id", () => {
  const onRowPress = jest.fn();
  setup({ entries: makeEntries(), onRowPress, stickyIndices: [0] });

  fireEvent.press(screen.getAllByTestId(transactionsTestIds.row)[0]);

  expect(onRowPress).toHaveBeenCalledWith("tx-1");
});

it("SHOULD show the month picker only when open", () => {
  setup({ isMonthPickerOpen: false });
  expect(hasText("financial.transactions.monthPicker.title")).toBe(false);

  setup({ isMonthPickerOpen: true });
  expect(hasText("financial.transactions.monthPicker.title")).toBe(true);
});

it("SHOULD show a summary retry WHEN the summary failed", () => {
  const onSummaryRetry = jest.fn();
  setup({ onSummaryRetry, summary: undefined, summaryError: true });

  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(onSummaryRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the toolbar as the list header with 20 px gaps so it scrolls with the list", () => {
  setup({ entries: makeEntries() });

  const toolbar = within(screen.getByTestId("flashList")).getByTestId(
    "transactions-toolbar",
  );
  expect(StyleSheet.flatten(toolbar.props.style).gap).toBe(20);
});

const scopeChoices = [
  { labelKey: "financial.common.all", value: "ALL" },
  { labelKey: "financial.common.personal", value: "user-id" },
  { label: "Test Family", value: "family-1" },
] as const;

it("SHOULD show Import CSV and Export CSV (spec 047) and open the export modal", () => {
  setup({ scopeChoices: [...scopeChoices] });

  // Compact: the actions are the items of the overflow menu.
  fireEvent.press(screen.getByTestId(transactionsTestIds.moreActions));
  expect(
    screen.getByTestId(transactionsTestIds.importButton),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(transactionsTestIds.exportButton));

  expect(screen.getByTestId(transactionsTestIds.exportSheet)).toBeOnTheScreen();
});

it("SHOULD render the header with switcher, scope chips, summary and type control", () => {
  setup({ scopeChoices: [...scopeChoices] });

  [
    transactionsTestIds.monthPrevious,
    `${transactionsTestIds.scopeFilter}-ALL`,
    transactionsTestIds.monthSummary,
    transactionsTestIds.typeFilter,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
  // The CSV actions moved to the page header (spec 050): the toolbar starts with the month switcher.
  expect(screen.getByTestId("transactions-toolbar").children).toHaveLength(5);
});

it("SHOULD give every scope chip an id from its owner id and call onOwnerFilterChange", () => {
  const onOwnerFilterChange = jest.fn();
  setup({ onOwnerFilterChange, scopeChoices: [...scopeChoices] });

  fireEvent.press(
    screen.getByTestId(`${transactionsTestIds.scopeFilter}-family-1`),
  );

  expect(onOwnerFilterChange).toHaveBeenCalledWith("family-1");
});

it("SHOULD put an icon on Personal and families but none on All", () => {
  setup({ scopeChoices: [...scopeChoices] });

  const scope = transactionsTestIds.scopeFilter;
  expect(screen.queryByTestId(`${scope}-ALL-icon`)).not.toBeOnTheScreen();
  expect(screen.getByTestId(`${scope}-user-id-icon`)).toBeOnTheScreen();
  expect(screen.getByTestId(`${scope}-family-1-icon`)).toBeOnTheScreen();
});

it.each([
  ["ALL", "financial.common.all"],
  ["user-id", "financial.common.personal"],
  ["family-1", "Test Family"],
])("SHOULD show the scope caption for %s", (ownerFilter, caption) => {
  setup({ ownerFilter, scopeChoices: [...scopeChoices] });

  expect(
    screen.getByTestId(transactionsTestIds.summaryScope),
  ).toHaveTextContent(
    ownerFilter === "ALL" ? "financial.transactions.scope.all" : caption,
  );
});

it("SHOULD call onTypeFilterChange from the segmented control", () => {
  const onTypeFilterChange = jest.fn();
  setup({ onTypeFilterChange });

  fireEvent.press(
    screen.getByTestId(`${transactionsTestIds.typeFilter}-EXPENSE`),
  );

  expect(onTypeFilterChange).toHaveBeenCalledWith("EXPENSE");
});

it("SHOULD title the balance with the month name only", () => {
  setup({ monthName: "October" });

  expect(hasText('financial.transactions.balanceOf {"month":"October"}')).toBe(
    true,
  );
});

it("SHOULD open the delete-only sheet (and NOT the form) WHEN an adjustment row is tapped", () => {
  const onOpen = jest.fn();
  const onRowPress = jest.fn();
  const adjustment = new TransactionUIModel(
    makeTransactionDTO({
      excludeFromTotals: true,
      id: "adj-1",
      systemKey: "BALANCE_ADJUSTMENT",
    }),
  );
  setup(
    {
      entries: [{ item: adjustment, key: "item-adj-1", kind: "item" }],
      onRowPress,
    },
    { onOpen },
  );

  fireEvent.press(screen.getByTestId(transactionsTestIds.adjustmentRow));

  expect(onOpen).toHaveBeenCalledWith(adjustment);
  expect(onRowPress).not.toHaveBeenCalled();
});

it("SHOULD still open the form WHEN a regular row is tapped", () => {
  const onOpen = jest.fn();
  const onRowPress = jest.fn();
  setup({ entries: makeEntries(), onRowPress }, { onOpen });

  fireEvent.press(screen.getAllByTestId(transactionsTestIds.row)[0]);

  expect(onRowPress).toHaveBeenCalledWith("tx-1");
  expect(onOpen).not.toHaveBeenCalled();
});

it("SHOULD render the sheet for the opened adjustment", () => {
  const adjustment = new TransactionUIModel(
    makeTransactionDTO({
      excludeFromTotals: true,
      id: "adj-1",
      systemKey: "BALANCE_ADJUSTMENT",
    }),
  );
  setup({}, { item: adjustment });

  expect(
    screen.getByTestId(transactionsTestIds.adjustmentSheet),
  ).toBeOnTheScreen();
});

describe("card invoices (spec 029)", () => {
  it("SHOULD render an invoice entry as a CardInvoiceRow", () => {
    setup({
      entries: [
        ...makeEntries(),
        { invoice: makeInvoice(), key: "invoice-1", kind: "invoice" },
      ],
    });

    expect(
      screen.getByTestId(transactionsTestIds.cardInvoiceRow),
    ).toBeOnTheScreen();
  });

  it("SHOULD show an inline error with retry WHEN the invoices failed AND keep the account rows", () => {
    const onInvoiceRetry = jest.fn();
    setup({ entries: makeEntries(), invoicesError: true, onInvoiceRetry });

    expect(screen.getAllByTestId(transactionsTestIds.row)).toHaveLength(2);
    expect(
      screen.getByTestId(transactionsTestIds.cardInvoiceError),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByText("common.actions.tryAgain"));
    expect(onInvoiceRetry).toHaveBeenCalledTimes(1);
  });
});

describe("day balance header (spec 035)", () => {
  function entriesWithBalance(): ListEntry[] {
    const entries = makeEntries();

    return [
      { ...entries[0], balanceCents: -5000, projected: true } as ListEntry,
      ...entries.slice(1),
    ];
  }

  it("SHOULD show the day net as the trailing value WHEN there is no balance", () => {
    setup({ entries: makeEntries(), stickyIndices: [0] });

    expect(
      screen.queryByTestId(`${transactionsTestIds.dayBalance}-2026-10-05`),
    ).toBeNull();
  });

  it("SHOULD make the header a toggle with the balance, the net and the projected mark", () => {
    const onDayToggle = jest.fn();
    setup({ entries: entriesWithBalance(), onDayToggle, stickyIndices: [0] });

    const header = screen.getByTestId(
      `${transactionsTestIds.dayBalance}-2026-10-05`,
    );

    expect(header.props.accessibilityRole).toBe("button");
    expect(
      screen.getByTestId(transactionsTestIds.dayBalanceProjected),
    ).toBeOnTheScreen();

    fireEvent.press(header);
    expect(onDayToggle).toHaveBeenCalledWith("2026-10-05");
  });

  it("SHOULD render the account lines AND the cards line of the expanded day", () => {
    const lines: ListEntry[] = [
      {
        accountId: "a1",
        balanceCents: 1000,
        dateKey: "2026-10-05",
        icon: "bank",
        isCards: false,
        isLast: false,
        key: "l1",
        kind: "balanceLine",
        name: "Checking",
      },
      {
        balanceCents: -450,
        dateKey: "2026-10-05",
        icon: "credit-card-outline",
        isCards: true,
        isLast: true,
        key: "l2",
        kind: "balanceLine",
        name: "",
      },
    ];
    const [header, ...rest] = entriesWithBalance();
    setup({
      entries: [header, ...lines, ...rest],
      expandedDayKey: "2026-10-05",
      stickyIndices: [0],
    });

    expect(
      screen.getByTestId(`${transactionsTestIds.dayBalanceLine}-a1`),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionsTestIds.dayBalanceCards),
    ).toBeOnTheScreen();
    expect(hasText("Checking")).toBe(true);
    expect(hasText("financial.transactions.dayBalance.cardsDue")).toBe(true);
  });
});

describe("archived family selected (spec 042)", () => {
  it("SHOULD show the read-only banner AND the toast, and no add action in the empty month", () => {
    setup({ isEmptyMonth: true, readOnly: true, toastVisible: true });

    expect(screen.getByTestId(transactionsTestIds.readOnlyBanner)).toBeTruthy();
    expect(screen.getByTestId(transactionsTestIds.readOnlyToast)).toBeTruthy();
    expect(hasText("financial.transactions.add")).toBe(false);
  });

  it("SHOULD not show the banner for a writable scope", () => {
    setup();

    expect(screen.queryByTestId(transactionsTestIds.readOnlyBanner)).toBeNull();
  });
});

describe("filters (spec 045)", () => {
  const filtering = {
    filterCount: 2,
    filtering: true,
    filters: {
      ...EMPTY_FILTERS,
      categoryIds: ["c1"],
      situation: "UNPAID" as const,
    },
  };

  it("SHOULD show the search, the Filters button without a badge and no chips when nothing is filtered", () => {
    setup();

    expect(screen.getByTestId(transactionsTestIds.search)).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionsTestIds.filtersButton),
    ).toBeOnTheScreen();
    expect(
      screen.queryByTestId(`${transactionsTestIds.filtersButton}-badge`),
    ).toBeNull();
    expect(
      screen.queryByTestId(`${transactionsTestIds.activeFilter}-categories`),
    ).toBeNull();
  });

  it("SHOULD show the badge with the number of groups, one chip per group, and remove one by its chip", () => {
    const onFilterRemove = jest.fn();

    setup({ ...filtering, onFilterRemove });

    expect(
      within(
        screen.getByTestId(`${transactionsTestIds.filtersButton}-badge`),
      ).getByText("2"),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${transactionsTestIds.activeFilter}-categories`),
    ).toBeOnTheScreen();
    fireEvent.press(
      screen.getByTestId(
        `${transactionsTestIds.activeFilter}-situation-remove`,
      ),
    );
    expect(onFilterRemove).toHaveBeenCalledWith("situation");
  });

  it("SHOULD clear every filter with Clear all and send the typed search", () => {
    const onFiltersClear = jest.fn();
    const onSearchChange = jest.fn();

    setup({ ...filtering, onFiltersClear, onSearchChange });

    fireEvent.press(screen.getByTestId(transactionsTestIds.clearFilters));
    expect(onFiltersClear).toHaveBeenCalledTimes(1);
    fireEvent.changeText(
      screen.getByTestId(transactionsTestIds.search),
      "mercado",
    );
    expect(onSearchChange).toHaveBeenCalledWith("mercado");
  });

  it("SHOULD replace the month switcher with the period chip, and the month summary with the filtered one", () => {
    setup({
      ...filtering,
      filteredSummary: {
        count: 37,
        expenseCents: 348290,
        incomeCents: 0,
        resultCents: -348290,
      },
      filters: {
        ...EMPTY_FILTERS,
        period: { from: "2025-01-01", to: "2025-02-28" },
      },
      hasPeriod: true,
    });

    expect(
      screen.getByTestId(transactionsTestIds.periodChip),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId(transactionsTestIds.monthNext)).toBeNull();
    expect(
      screen.getByTestId(transactionsTestIds.filteredSummary),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId(transactionsTestIds.monthSummary)).toBeNull();
    expect(
      hasText(
        'financial.transactions.filters.count {"count":37} · financial.transactions.filters.resultOf',
      ),
    ).toBe(true);
  });

  it("SHOULD show the empty filters state and clear the filters from it", () => {
    const onFiltersClear = jest.fn();

    setup({
      ...filtering,
      entries: [],
      filtersEmpty: true,
      onFiltersClear,
    });

    expect(
      screen.getByTestId(transactionsTestIds.filtersEmpty),
    ).toBeOnTheScreen();
    fireEvent.press(
      screen.getByText("financial.transactions.filters.empty.action"),
    );
    expect(onFiltersClear).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show skeleton rows on the first load of a filter and an error with retry", () => {
    const onRefresh = jest.fn();

    setup({ ...filtering, entries: [], filtersLoading: true });
    expect(screen.getAllByTestId("transactions-skeleton")).toHaveLength(6);

    setup({ ...filtering, entries: [], filtersError: "boom", onRefresh });
    fireEvent.press(screen.getAllByText("common.actions.tryAgain").pop()!);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("SHOULD open the Filters modal from the button", () => {
    setup(filtering);

    fireEvent.press(screen.getByTestId(transactionsTestIds.filtersButton));

    expect(
      screen.getByTestId(transactionsTestIds.filtersApply),
    ).toBeOnTheScreen();
  });
});

describe("floating new transaction button (spec 050)", () => {
  it("SHOULD call onAddPress WHEN pressed, with the label as accessibility label", () => {
    const onAddPress = jest.fn();
    setup({ entries: makeEntries(), onAddPress });

    const fab = screen.getByTestId(transactionsTestIds.fab);
    expect(fab.props.accessibilityLabel).toBe("financial.transactions.fab");
    fireEvent.press(fab);

    expect(onAddPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["loaded", { entries: makeEntries() }],
    ["empty month", { entries: [], isEmptyMonth: true }],
    ["filtered empty", { entries: [], isFilteredEmpty: true }],
    ["error", { errorMessage: "boom" }],
  ])("SHOULD show the FAB WHEN %s", (_name, overrides) => {
    setup(overrides);

    expect(screen.getByTestId(transactionsTestIds.fab)).toBeOnTheScreen();
  });

  it("SHOULD hide the FAB WHILE the first load skeleton shows", () => {
    setup({ isLoading: true });

    expect(screen.queryByTestId(transactionsTestIds.fab)).toBeNull();
  });

  it("SHOULD reserve 88 px at the end of the list on compact", () => {
    setup({ entries: makeEntries() });

    expect(
      StyleSheet.flatten(
        screen.getByTestId("flashList").props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(88);
  });

  it("SHOULD reserve 120 px at the end of the list AND extend the FAB on wide", () => {
    jest
      .requireMock("@presentation/theme")
      .useBreakpoint.mockReturnValue("expanded");
    setup({ entries: makeEntries() });

    expect(
      StyleSheet.flatten(
        screen.getByTestId("flashList").props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(120);
    expect(screen.getByText("financial.transactions.fab")).toBeOnTheScreen();
    jest
      .requireMock("@presentation/theme")
      .useBreakpoint.mockReturnValue("compact");
  });

  it("SHOULD keep Import/Export out of the toolbar", () => {
    setup({ entries: makeEntries() });

    expect(
      within(screen.getByTestId("transactions-toolbar")).queryByTestId(
        transactionsTestIds.moreActions,
      ),
    ).toBeNull();
  });
});
