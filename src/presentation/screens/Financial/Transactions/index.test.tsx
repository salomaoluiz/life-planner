import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { makeEntries, setup } from "./mocks/screen.mocks";

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

  expect(hasText("financial.transactions.today")).toBe(true);
  expect(screen.getAllByTestId(/^transaction-row-tx-\d$/)).toHaveLength(2);
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

  fireEvent.press(screen.getAllByTestId(/^transaction-row-tx-\d$/)[0]);

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
