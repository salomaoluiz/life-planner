import { CatalogNode } from "./catalogEntries";
import {
  findNode,
  height,
  moveTargets,
  parentOptions,
  rootColorOf,
  subtreeIds,
} from "./catalogParents";

function node(
  id: string,
  name: string,
  children: CatalogNode[] = [],
  extra: Partial<CatalogNode> = {},
): CatalogNode {
  return {
    children,
    color: "#112233",
    icon: "package-variant",
    itemCount: 0,
    name,
    owner: "USER",
    ownerId: "u",
    status: "ACTIVE",
    ...extra,
    id,
  };
}

const grandchild = node("g", "Queijo", [], { parentId: "c" });
const child = node("c", "Laticínios", [grandchild], {
  color: "#445566",
  parentId: "r",
});
const root = node("r", "Mercado", [child], { color: "#778899" });
const other = node("o", "Outro");
const foreign = node("f", "Alheio", [], { ownerId: "x" });
const old = node("old", "Velho", [], { status: "ARCHIVED" });
const forest = [root, other, foreign, old];

it("SHOULD find nodes, measure heights and list subtrees", () => {
  expect(findNode(forest, "g")?.name).toBe("Queijo");
  expect(findNode(forest, "none")).toBeUndefined();
  expect(height(root)).toBe(2);
  expect(height(other)).toBe(0);
  expect(subtreeIds(root)).toEqual(["r", "c", "g"]);
});

describe("parentOptions", () => {
  it("SHOULD offer the active nodes of the owner with their path, up to the depth limit", () => {
    expect(parentOptions(forest, "category", "u")).toEqual([
      { label: "Mercado", value: "r" },
      { label: "Mercado › Laticínios", value: "c" },
      { label: "Outro", value: "o" },
    ]);
  });

  it("SHOULD stop at two levels for locations", () => {
    expect(
      parentOptions(forest, "location", "u").map((entry) => entry.value),
    ).toEqual(["r", "o"]);
  });

  it("SHOULD exclude the subtree being edited and keep the subtree within the limit", () => {
    // `root` has two levels below: under another main category its subtree would need four levels
    expect(parentOptions(forest, "category", "u", root)).toEqual([]);
    // `child` has one level below: only main categories fit
    expect(
      parentOptions(forest, "category", "u", child).map((entry) => entry.value),
    ).toEqual(["r", "o"]);
  });
});

it("SHOULD resolve the color of the root of a tree", () => {
  expect(rootColorOf(forest, "g")).toBe("#778899");
  expect(rootColorOf(forest, "o")).toBe("#112233");
  expect(rootColorOf(forest, "missing")).toBeUndefined();
});

it("SHOULD list the move targets: active, same owner, outside the deleted subtree", () => {
  expect(moveTargets(forest, "u", root).map((entry) => entry.value)).toEqual([
    "o",
  ]);
  expect(moveTargets(forest, "u", other).map((entry) => entry.value)).toEqual([
    "r",
    "c",
    "g",
  ]);
});
