import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { makeRows, setup } from "./mocks/screen.mocks";

it("SHOULD render skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("categories-skeleton")).toHaveLength(6);
});

it("SHOULD render ErrorState with a retry that calls onRetry", () => {
  const onRetry = jest.fn();
  setup({ errorMessage: "boom", onRetry });

  expect(hasText("boom")).toBe(true);
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty state per type with a new category action", () => {
  const onAddPress = jest.fn();
  setup({ isEmpty: true, onAddPress });

  expect(hasText("financial.categories.emptyExpense")).toBe(true);
  fireEvent.press(screen.getAllByText("financial.categories.new")[0]);
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the sub count only on roots and a chevron only with children", () => {
  setup({ rows: makeRows() });

  expect(hasText('financial.categories.subcount {"count":2}')).toBe(true);
  expect(screen.getAllByText(/financial.categories.subcount/)).toHaveLength(1);
  expect(screen.getByTestId("category-row-root-container")).toBeTruthy();
  expect(screen.getByTestId("category-row-leaf-container")).toBeTruthy();
  expect(screen.getAllByTestId("category-row-chevron")).toHaveLength(1);
});

it("SHOULD call onAddPress from the plus button", () => {
  const onAddPress = jest.fn();
  setup({ onAddPress, rows: makeRows() });

  fireEvent.press(screen.getByLabelText("financial.categories.new"));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD call onRowPress with the id WHEN a row is tapped", () => {
  const onRowPress = jest.fn();
  setup({ onRowPress, rows: makeRows() });

  fireEvent.press(screen.getByText("Snacks"));
  expect(onRowPress).toHaveBeenCalledWith("leaf");
});
