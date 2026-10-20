import { makeCategoryDTO } from "../mocks/index.mocks";
import { buildCategoryEntries } from "./categoryEntries";
import CategoryRowUIModel from "./CategoryRowUIModel";

function row(id: string, depth = 0, status?: "ARCHIVED") {
  return new CategoryRowUIModel({
    category: makeCategoryDTO({ id, name: id, status }),
    childCount: 0,
    depth,
  });
}

it("SHOULD have no toggle WHEN nothing is archived", () => {
  const entries = buildCategoryEntries([row("a"), row("b")], [], false);

  expect(entries.map((entry) => entry.kind)).toEqual(["row", "row"]);
});

it("SHOULD show the collapsed toggle with the archived count AND hide the archived rows", () => {
  const entries = buildCategoryEntries(
    [row("a")],
    [row("old", 0, "ARCHIVED"), row("old-child", 1, "ARCHIVED")],
    false,
  );

  expect(entries.map((entry) => entry.key)).toEqual([
    "row-a",
    "archived-toggle",
  ]);
  expect(entries[1]).toMatchObject({ count: 2, expanded: false });
});

it("SHOULD list the archived parent followed by its child WHEN expanded", () => {
  const entries = buildCategoryEntries(
    [row("a")],
    [row("old", 0, "ARCHIVED"), row("old-child", 1, "ARCHIVED")],
    true,
  );

  expect(entries.map((entry) => entry.key)).toEqual([
    "row-a",
    "archived-toggle",
    "row-old",
    "row-old-child",
  ]);
  expect(entries[2]).toMatchObject({ isLast: false });
  expect(entries[3]).toMatchObject({ isLast: true });
});
