import { fireEvent, screen, within } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { hasText } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { makeTransactionDTO } from "./mocks/index.mocks";
import { makeInvoice } from "./mocks/invoice.mocks";
import { makeEntries, setup } from "./mocks/screen.mocks";
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

it("SHOULD render the header with switcher, scope chips, summary and type control", () => {
  setup({ scopeChoices: [...scopeChoices] });

  [
    transactionsTestIds.monthPrevious,
    `${transactionsTestIds.scopeFilter}-ALL`,
    transactionsTestIds.monthSummary,
    transactionsTestIds.typeFilter,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
  expect(screen.getByTestId("transactions-toolbar").children).toHaveLength(4);
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
