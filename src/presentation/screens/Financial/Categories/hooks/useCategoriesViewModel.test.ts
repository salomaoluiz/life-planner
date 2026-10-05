import { act } from "@tests";

import {
  cat,
  categoriesQuery,
  givenData,
  setup,
  spies,
} from "./mocks/useCategoriesViewModel.mocks";
import { fetchCategories } from "./useCategoriesViewModel";

describe("fetchCategories", () => {
  it("SHOULD load owners then the categories of those owners", async () => {
    const owner = { id: "user-id", name: "Alice Test", type: "USER" };
    const categories = [cat("food", "Food", "EXPENSE")];
    spies.getOwners.mockResolvedValue([owner] as never);
    spies.getCategories.mockResolvedValue(categories);

    const result = await fetchCategories();

    expect(spies.getCategories).toHaveBeenCalledWith(["user-id"]);
    expect(result).toEqual({ categories, owners: [owner] });
  });
});

it("SHOULD default to expenses and all owners", () => {
  givenData([
    cat("food", "Food", "EXPENSE"),
    cat("salary", "Salary", "INCOME"),
  ]);
  const { result } = setup();

  expect(result.current.type).toBe("EXPENSE");
  expect(result.current.ownerFilter).toBe("ALL");
  expect(result.current.rows.map((row) => row.id)).toEqual(["food"]);
});

it("SHOULD switch to income categories", () => {
  givenData([
    cat("food", "Food", "EXPENSE"),
    cat("salary", "Salary", "INCOME"),
  ]);
  const { result } = setup();

  act(() => {
    result.current.onTypeChange("INCOME");
  });

  expect(result.current.rows.map((row) => row.id)).toEqual(["salary"]);
});

it("SHOULD filter by owner", () => {
  givenData([
    cat("mine", "Mine", "EXPENSE", "user-id"),
    cat("shared", "Shared", "EXPENSE", "family-1"),
  ]);
  const { result } = setup();

  act(() => {
    result.current.onOwnerFilterChange("family-1");
  });

  expect(result.current.rows.map((row) => row.id)).toEqual(["shared"]);
});

it("SHOULD build the tree with depth and sub count", () => {
  givenData([
    cat("a", "A", "EXPENSE"),
    cat("b", "B", "EXPENSE", "user-id", "a"),
    cat("c", "C", "EXPENSE", "user-id", "b"),
  ]);
  const { result } = setup();

  expect(result.current.rows.map((r) => [r.id, r.depth, r.subcount])).toEqual([
    ["a", 0, 1],
    ["b", 1, 0],
    ["c", 2, 0],
  ]);
});

it("SHOULD flag empty with the type-specific title key", () => {
  givenData([]);
  const { result } = setup();

  expect(result.current.isEmpty).toBe(true);
  expect(result.current.emptyTitleKey).toBe(
    "financial.categories.emptyExpense",
  );
  act(() => {
    result.current.onTypeChange("INCOME");
  });
  expect(result.current.emptyTitleKey).toBe("financial.categories.emptyIncome");
});

it("SHOULD open the form to add and to edit a row", () => {
  givenData([]);
  const { result } = setup();

  result.current.onAddPress();
  result.current.onRowPress("cat-1");

  expect(spies.push).toHaveBeenNthCalledWith(
    1,
    "/financial/category/add_new_category",
  );
  expect(spies.push).toHaveBeenNthCalledWith(2, {
    params: { id: "cat-1" },
    pathname: "/financial/category/add_new_category",
  });
});

it("SHOULD refetch WHEN the screen is focused", () => {
  givenData([]);
  spies.isFocused.mockReturnValue(true);

  setup();

  expect(categoriesQuery.value.refetch).toHaveBeenCalled();
});

it("SHOULD expose the loading and error states", () => {
  categoriesQuery.reset().withIsFetching(true);
  expect(setup().result.current.isLoading).toBe(true);

  categoriesQuery.reset().withError();
  expect(setup().result.current.errorMessage).toBeDefined();
});
