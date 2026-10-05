import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { makeEntries, setup } from "./mocks/screen.mocks";

it("SHOULD render skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("accounts-skeleton")).toHaveLength(6);
});

it("SHOULD render ErrorState with a retry that calls onRetry", () => {
  const onRetry = jest.fn();
  setup({ errorMessage: "boom", onRetry });

  expect(hasText("boom")).toBe(true);
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty state with a new account action", () => {
  const onAddPress = jest.fn();
  setup({ isEmpty: true, onAddPress });

  expect(hasText("financial.accounts.emptyTitle")).toBe(true);
  fireEvent.press(screen.getAllByText("financial.accounts.new")[0]);
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the total label and amount and call onAddPress from the plus button", () => {
  const onAddPress = jest.fn();
  setup({ entries: makeEntries(), onAddPress, totalAmount: { value: 12345 } });

  expect(hasText("financial.accounts.total")).toBe(true);
  expect(screen.getByTestId("accounts-total")).toBeTruthy();
  fireEvent.press(screen.getByLabelText("financial.accounts.new"));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render the section, rows with owner and balance", () => {
  setup({ entries: makeEntries() });

  expect(hasText("financial.accounts.active")).toBe(true);
  expect(hasText("Checking")).toBe(true);
  expect(hasText("Card")).toBe(true);
  expect(screen.getAllByText("Alice Test")).toHaveLength(2);
});

it("SHOULD show the archived toggle with count and call onArchivedToggle", () => {
  const onArchivedToggle = jest.fn();
  setup({ entries: makeEntries(), onArchivedToggle });

  expect(hasText('financial.accounts.archived {"count":2}')).toBe(true);
  expect(screen.queryByText("Old")).toBeNull();
  fireEvent.press(screen.getByTestId("archived-toggle"));
  expect(onArchivedToggle).toHaveBeenCalledTimes(1);
});

it("SHOULD show archived rows WHEN expanded", () => {
  setup({ entries: makeEntries(true) });

  expect(hasText("Old")).toBe(true);
});

it("SHOULD call onRowPress with the id WHEN a row is tapped", () => {
  const onRowPress = jest.fn();
  setup({ entries: makeEntries(), onRowPress });

  fireEvent.press(screen.getByText("Checking"));
  expect(onRowPress).toHaveBeenCalledWith("acc-1");
});
