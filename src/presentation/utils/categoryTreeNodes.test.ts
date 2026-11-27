import CategoryDTO from "@application/dto/financial/CategoryDTO";

import {
  flattenCatalogNodes,
  mostUsedCatalogIds,
  toTreeNode,
  toTreeNodes,
} from "./categoryTreeNodes";

it("SHOULD map a category to a picker node and flag the archived ones", () => {
  const nodes = toTreeNodes([
    new CategoryDTO({
      icon: "cart",
      iconColor: "#F59E0B",
      id: "c1",
      name: "Market",
      owner: "USER",
      ownerId: "user-id",
      parentId: "c0",
      status: "ARCHIVED",
      type: "EXPENSE",
    }),
  ]);

  expect(nodes).toEqual([
    {
      archived: true,
      color: "#F59E0B",
      icon: "cart",
      id: "c1",
      name: "Market",
      parentId: "c0",
    },
  ]);
});

it("SHOULD carry the badge the screen derives from the category", () => {
  const [node] = toTreeNodes(
    [
      new CategoryDTO({
        icon: "cart",
        id: "c1",
        name: "Salary",
        owner: "USER",
        ownerId: "user-id",
        type: "INCOME",
      }),
    ],
    (category) => category.type,
  );

  expect(node.badge).toBe("INCOME");
});

it("SHOULD build a node from a category-like record with a default icon", () => {
  expect(toTreeNode({ iconColor: "#F59E0B", id: "a", name: "A" })).toEqual({
    color: "#F59E0B",
    icon: "shape-outline",
    id: "a",
    name: "A",
    parentId: undefined,
  });
});

it("SHOULD flatten the active catalog nodes with their children and skip archived ones", () => {
  function leaf(id: string, status = "ACTIVE") {
    return {
      children: [],
      color: "#14B8A6",
      icon: "fridge",
      id,
      name: id,
      parentId: "kitchen",
      status,
    };
  }
  const nodes = flattenCatalogNodes([
    {
      children: [leaf("fridge"), leaf("old", "ARCHIVED")],
      color: "#F59E0B",
      icon: "stove",
      id: "kitchen",
      name: "Kitchen",
      status: "ACTIVE",
    },
  ]);

  expect(nodes.map((node) => node.id)).toEqual(["kitchen", "fridge"]);
  expect(nodes[1].parentId).toBe("kitchen");
});

it("SHOULD rank the active catalog nodes by item count and drop the empty ones", () => {
  function node(id: string, itemCount: number, status = "ACTIVE") {
    return {
      children: [],
      color: "#14B8A6",
      icon: "tag",
      id,
      itemCount,
      name: id,
      status,
    };
  }

  expect(
    mostUsedCatalogIds(
      [node("a", 1), node("b", 5), node("c", 0), node("d", 9, "ARCHIVED")],
      2,
    ),
  ).toEqual(["b", "a"]);
});
