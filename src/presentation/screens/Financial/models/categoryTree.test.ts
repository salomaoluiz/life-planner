import CategoryDTO from "@application/dto/financial/CategoryDTO";

import {
  buildCategoryRows,
  categoriesOf,
  descendantIds,
  filterRowsByQuery,
} from "./categoryTree";

function category(
  id: string,
  name: string,
  overrides: Partial<ConstructorParameters<typeof CategoryDTO>[0]> = {},
) {
  return new CategoryDTO({
    icon: "folder",
    id,
    name,
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    ...overrides,
  });
}

it("SHOULD list roots by name with children right after their parent", () => {
  const rows = buildCategoryRows([
    category("food", "Food"),
    category("bills", "Bills"),
    category("rent", "Rent", { parentId: "bills" }),
    category("energy", "Energy", { parentId: "bills" }),
    category("lunch", "Lunch", { parentId: "food" }),
  ]);

  expect(
    rows.map((row) => [row.category.id, row.depth, row.childCount]),
  ).toEqual([
    ["bills", 0, 2],
    ["energy", 1, 0],
    ["rent", 1, 0],
    ["food", 0, 1],
    ["lunch", 1, 0],
  ]);
});

it("SHOULD support deeper levels", () => {
  const rows = buildCategoryRows([
    category("a", "A"),
    category("b", "B", { parentId: "a" }),
    category("c", "C", { parentId: "b" }),
  ]);

  expect(rows.map((row) => row.depth)).toEqual([0, 1, 2]);
});

it("SHOULD show a category whose parent is missing as a root", () => {
  const rows = buildCategoryRows([
    category("orphan", "Orphan", { parentId: "gone" }),
  ]);

  expect(rows).toHaveLength(1);
  expect(rows[0].depth).toBe(0);
});

it("SHOULD not loop WHEN categories reference each other", () => {
  const rows = buildCategoryRows([
    category("a", "A", { parentId: "b" }),
    category("b", "B", { parentId: "a" }),
    category("self", "Self", { parentId: "self" }),
  ]);

  expect(rows.map((row) => row.category.id).sort()).toEqual(["a", "b", "self"]);
});

it("SHOULD return the descendants of a category without itself", () => {
  const list = [
    category("a", "A"),
    category("b", "B", { parentId: "a" }),
    category("c", "C", { parentId: "b" }),
    category("d", "D"),
  ];

  expect(descendantIds(list, "a")).toEqual(new Set(["b", "c"]));
  expect(descendantIds(list, "d")).toEqual(new Set());
});

it("SHOULD return no descendants for a cycle but stay finite", () => {
  const list = [
    category("a", "A", { parentId: "b" }),
    category("b", "B", { parentId: "a" }),
  ];

  expect(descendantIds(list, "a")).toEqual(new Set(["b"]));
});

it("SHOULD keep only categories of the owner and type", () => {
  const list = [
    category("a", "A"),
    category("b", "B", { type: "INCOME" }),
    category("c", "C", { ownerId: "family-1" }),
  ];

  expect(categoriesOf(list, "user-id", "EXPENSE").map((c) => c.id)).toEqual([
    "a",
  ]);
});

it("SHOULD filter rows by name ignoring case and accents", () => {
  const rows = buildCategoryRows([
    category("a", "Educação"),
    category("b", "Lazer"),
  ]);

  expect(
    filterRowsByQuery(rows, "educacao").map((row) => row.category.id),
  ).toEqual(["a"]);
  expect(filterRowsByQuery(rows, "").length).toBe(2);
  expect(filterRowsByQuery(rows, "zzz")).toEqual([]);
});
