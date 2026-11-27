import {
  buildTreeRows,
  columnSplit,
  descendantIdsOf,
  filterTreeByQuery,
  TreeNode,
  visibleNodes,
} from "./treeModel";

function node(id: string, name: string, parentId?: string): TreeNode {
  return { color: "#112233", icon: "tag", id, name, parentId };
}

const tree: TreeNode[] = [
  node("food", "Alimentação"),
  node("market", "Mercado", "food"),
  node("veg", "Hortifruti", "market"),
  node("meat", "Açougue", "market"),
  node("rest", "Restaurante", "food"),
  node("delivery", "Delivery", "rest"),
  node("bakery", "Padaria", "food"),
  node("home", "Casa"),
  node("clean", "Limpeza", "home"),
  node("bills", "Contas de casa", "home"),
  node("energy", "Energia", "bills"),
  node("water", "Água", "bills"),
  node("transport", "Transporte"),
  node("health", "Saúde"),
  node("fun", "Lazer"),
];

function names(nodes: TreeNode[]) {
  return nodes.map((item) => item.name).sort();
}

describe("filterTreeByQuery", () => {
  it("keeps the context of a middle match", () => {
    expect(names(filterTreeByQuery(tree, "mercado"))).toEqual(
      [
        "Alimentação",
        "Mercado",
        "Hortifruti",
        "Açougue",
        "Restaurante",
        "Delivery",
        "Padaria",
      ].sort(),
    );
  });

  it("drops the uncle of a deep match", () => {
    expect(names(filterTreeByQuery(tree, "energia"))).toEqual(
      ["Casa", "Contas de casa", "Energia", "Água"].sort(),
    );
  });

  it("returns only the subtree of a root match", () => {
    expect(names(filterTreeByQuery(tree, "casa"))).toEqual(
      ["Casa", "Limpeza", "Contas de casa", "Energia", "Água"].sort(),
    );
  });

  it("ignores accents and case", () => {
    const accents = [node("a", "Acentuação")];

    expect(filterTreeByQuery(accents, "ACENTUACAO")).toHaveLength(1);
  });

  it("unions several matches once each", () => {
    const result = filterTreeByQuery(tree, "energia ")
      .concat(filterTreeByQuery(tree, "padaria"))
      .map((item) => item.id);

    expect(new Set(result).size).toBeLessThan(result.length + 1);
    const both = filterTreeByQuery(tree, "e");
    expect(new Set(both.map((item) => item.id)).size).toBe(both.length);
  });

  it("returns every node for a blank query", () => {
    expect(filterTreeByQuery(tree, "   ")).toBe(tree);
  });

  it("returns nothing when no node matches", () => {
    expect(filterTreeByQuery(tree, "zzz")).toEqual([]);
  });

  it("terminates on a parent cycle", () => {
    const cycle = [node("a", "Alpha", "b"), node("b", "Beta", "a")];

    expect(filterTreeByQuery(cycle, "alpha").length).toBeGreaterThan(0);
  });
});

describe("buildTreeRows", () => {
  it("orders roots and children alphabetically with depth and path", () => {
    const rows = buildTreeRows(tree);

    expect(rows.slice(0, 3).map((row) => row.node.name)).toEqual([
      "Alimentação",
      "Mercado",
      "Açougue",
    ]);
    expect(rows[2].depth).toBe(2);
    expect(rows[2].path).toEqual(["Alimentação", "Mercado", "Açougue"]);
  });

  it("treats a missing parent as a root and survives cycles", () => {
    const rows = buildTreeRows([
      node("a", "Alpha", "missing"),
      node("b", "Beta", "c"),
      node("c", "Gamma", "b"),
    ]);

    expect(rows).toHaveLength(3);
    expect(rows[0].depth).toBe(0);
  });
});

describe("visibleNodes", () => {
  it("drops archived nodes except the current ones", () => {
    const nodes = [
      { ...node("a", "A"), archived: true },
      { ...node("b", "B"), archived: true },
      node("c", "C"),
    ];

    expect(visibleNodes(nodes, ["b"]).map((item) => item.id)).toEqual([
      "b",
      "c",
    ]);
  });
});

describe("descendantIdsOf", () => {
  it("collects every depth", () => {
    expect([...descendantIdsOf(tree, "home")].sort()).toEqual(
      ["bills", "clean", "energy", "water"].sort(),
    );
  });
});

describe("columnSplit", () => {
  it("never splits a root group and balances by rows", () => {
    const [left, right] = columnSplit(buildTreeRows(tree));
    const leftRoots = left.filter((row) => row.depth === 0).length;

    expect(left.length + right.length).toBe(tree.length);
    expect(left[0].depth).toBe(0);
    expect(right[0]?.depth ?? 0).toBe(0);
    expect(leftRoots).toBeGreaterThan(0);
  });

  it("handles an empty list", () => {
    expect(columnSplit([])).toEqual([[], []]);
  });
});
