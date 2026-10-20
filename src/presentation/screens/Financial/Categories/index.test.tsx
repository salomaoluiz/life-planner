import { fireEvent, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { hasText } from "@tests";

import { makeCategoryDTO } from "./mocks/index.mocks";
import { makeRows, setup } from "./mocks/screen.mocks";
import CategoryRowUIModel from "./models/CategoryRowUIModel";
import categoriesTestIds from "./testIds";

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
  expect(screen.getByTestId(categoriesTestIds.emptyState)).toBeOnTheScreen();
  fireEvent.press(screen.getAllByText("financial.categories.new")[0]);
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the sub count only on roots and a chevron only with children", () => {
  setup({ rows: makeRows() });

  expect(hasText('financial.categories.subcount_other {"count":2}')).toBe(true);
  expect(screen.getAllByText(/financial.categories.subcount/)).toHaveLength(1);
  expect(screen.getByTestId(categoriesTestIds.screen)).toBeOnTheScreen();
  expect(screen.getByTestId(`${categoriesTestIds.row}-container`)).toBeTruthy();
  expect(
    screen.getByTestId(`${categoriesTestIds.childRow}-container`),
  ).toBeTruthy();
  expect(screen.getAllByTestId("category-row-chevron")).toHaveLength(1);
});

it("SHOULD call onAddPress from the plus button", () => {
  const onAddPress = jest.fn();
  setup({ onAddPress, rows: makeRows() });

  fireEvent.press(screen.getByLabelText("financial.categories.new"));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD call onAddPress from the add button testID", () => {
  const onAddPress = jest.fn();
  setup({ onAddPress, rows: makeRows() });

  fireEvent.press(screen.getByTestId(categoriesTestIds.addButton));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD report the type change from the segmented control", () => {
  const onTypeChange = jest.fn();
  setup({ onTypeChange, rows: makeRows() });

  fireEvent.press(screen.getByTestId(`${categoriesTestIds.type}-INCOME`));
  expect(onTypeChange).toHaveBeenCalledWith("INCOME");
});

it("SHOULD call onRowPress with the id WHEN a row is tapped", () => {
  const onRowPress = jest.fn();
  setup({ onRowPress, rows: makeRows() });

  fireEvent.press(screen.getByText("Snacks"));
  expect(onRowPress).toHaveBeenCalledWith("leaf");
});

it("SHOULD space the toolbar blocks and the list by 20 px", () => {
  setup({ rows: makeRows() });

  const style = StyleSheet.flatten(
    screen.getByTestId("categories-toolbar").props.style,
  );
  expect(style.gap).toBe(20);
  expect(style.paddingBottom).toBe(20);
});

it("SHOULD draw a divider between rows but not after the last one", () => {
  setup({ rows: makeRows() });

  expect(
    screen.getAllByTestId(/^financial\.categories\.(child-)?row-divider$/),
  ).toHaveLength(makeRows().length - 1);
});

it("SHOULD give every owner filter chip an id from its owner id", () => {
  setup({
    ownerChoices: [
      { labelKey: "financial.common.all", value: "ALL" },
      { label: "Test Family", value: "owner-2" },
    ],
    rows: makeRows(),
  });

  expect(
    screen.getByTestId(`${categoriesTestIds.ownerFilter}-owner-2`),
  ).toBeOnTheScreen();
});

it("SHOULD show the All marker on an All row AND the owner badge on the others", () => {
  setup({
    ownerChoices: [
      { labelKey: "financial.common.all", value: "ALL" },
      { label: "Test Family", value: "family-1" },
    ],
    rows: [
      new CategoryRowUIModel({
        category: makeCategoryDTO({
          id: "mercado",
          name: "Mercado",
          scope: "ALL",
          scopeOwnerIds: ["user-id", "family-1"],
        }),
        childCount: 0,
        depth: 0,
      }),
      new CategoryRowUIModel({
        category: makeCategoryDTO({
          id: "rent",
          name: "Rent",
          owner: "FAMILY",
          ownerId: "family-1",
        }),
        childCount: 0,
        depth: 0,
      }),
    ],
  });

  expect(screen.getAllByTestId(categoriesTestIds.scopeAll)).toHaveLength(1);
  expect(hasText("financial.categories.scopeAll")).toBe(true);
  expect(screen.getAllByTestId(categoriesTestIds.ownerBadge)).toHaveLength(1);
  expect(hasText("Test Family")).toBe(true);
});
