import {
  addCreated,
  createdList,
  deletionPlan,
  descendantsOf,
  removeCreated,
  unmatchCategories,
} from "./createdCategories";
import { ImportRecords, ValueEntry } from "./importValues";

function item(id: string, name: string, path: string, parentId?: string) {
  return {
    depthLevel: 0,
    iconColor: "#EF4444",
    id,
    name,
    parentId,
    path,
    type: "EXPENSE" as const,
  };
}

const categories = [
  item("a", "A", "A"),
  item("b", "B", "A > B", "a"),
  item("c", "C", "A > B > C", "b"),
  item("d", "D", "D"),
];

function entry(key: string, selected?: string): ValueEntry {
  return { auto: false, key, rows: 3, selected, value: key };
}

describe("descendantsOf", () => {
  it("SHOULD list children and grandchildren but not the siblings", () => {
    expect(descendantsOf("a", categories)).toEqual(["b", "c"]);
    expect(descendantsOf("d", categories)).toEqual([]);
  });
});

describe("addCreated / removeCreated", () => {
  it("SHOULD accumulate per owner without duplicates and remove by id", () => {
    const first = addCreated([], "o1", ["a", "b"]);
    const second = addCreated(first, "o2", ["b", "z"]);

    expect(second).toEqual([
      { id: "a", ownerId: "o1" },
      { id: "b", ownerId: "o1" },
      { id: "z", ownerId: "o2" },
    ]);
    expect(removeCreated(second, ["a", "z"])).toEqual([
      { id: "b", ownerId: "o1" },
    ]);
  });
});

describe("unmatchCategories", () => {
  it("SHOULD unmatch every value pointing at a deleted id, in any owner, and keep the others", () => {
    const choices = {
      account: { x: "acc" },
      category: {
        "o1|EXPENSE|x": "a",
        "o1|EXPENSE|z": "d",
        "o2|EXPENSE|y": "c",
      },
    };

    expect(unmatchCategories(choices, ["a", "b", "c"])).toEqual({
      account: { x: "acc" },
      category: { "o1|EXPENSE|z": "d" },
    });
  });
});

describe("deletionPlan", () => {
  it("SHOULD list the subtree, the descendant names and the affected values", () => {
    const plan = deletionPlan("a", categories, [
      entry("v1", "c"),
      entry("v2", "d"),
      entry("v3"),
    ]);

    expect(plan.ids).toEqual(["a", "b", "c"]);
    expect(plan.names).toEqual(["B", "C"]);
    expect(plan.path).toBe("A");
    expect(plan.affectedValues.map((value) => value.key)).toEqual(["v1"]);
  });
});

describe("createdList", () => {
  it("SHOULD describe the created categories with depth, children and values, skipping unknown ids", () => {
    const catalog: Record<string, ImportRecords> = {
      o1: { accounts: [], cards: [], categories },
    };
    const list = createdList(
      [
        { id: "a", ownerId: "o1" },
        { id: "b", ownerId: "o1" },
        { id: "gone", ownerId: "o1" },
      ],
      catalog,
      [entry("v1", "b"), entry("v2", "b")],
    );

    expect(
      list.map((row) => [row.id, row.depth, row.childCount, row.valuesCount]),
    ).toEqual([
      ["a", 0, 1, 0],
      ["b", 1, 1, 2],
    ]);
  });
});
