import {
  buildCatalogEntries,
  CatalogNode,
  nodesInScope,
} from "./catalogEntries";

function node(
  id: string,
  name: string,
  extra: Partial<CatalogNode> = {},
): CatalogNode {
  return {
    children: [],
    color: "#8A8F98",
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

const tree = [
  node("zeta", "Zeta"),
  node("alpha", "Álcool", {
    children: [
      node("c2", "Beta", { parentId: "alpha" }),
      node("c1", "alfa", { parentId: "alpha" }),
      node("c3", "Old", { parentId: "alpha", status: "ARCHIVED" }),
    ],
  }),
  node("gone", "Antiga", { status: "ARCHIVED" }),
];

describe("buildCatalogEntries", () => {
  it("SHOULD sort alphabetically ignoring accents, parents first, children under each parent", () => {
    const rows = buildCatalogEntries(tree, false).filter(
      (entry) => entry.kind === "row",
    );

    expect(
      rows.map(
        (entry) => entry.kind === "row" && [entry.row.node.id, entry.row.depth],
      ),
    ).toEqual([
      ["alpha", 0],
      ["c1", 1],
      ["c2", 1],
      ["zeta", 0],
    ]);
  });

  it("SHOULD count the active children and flag the parent", () => {
    const first = buildCatalogEntries(tree, false)[0];

    expect(first.kind === "row" && first.row.subcount).toBe(2);
    expect(first.kind === "row" && first.row.hasChildren).toBe(true);
  });

  it("SHOULD keep the archived rows in a collapsed group at the end and open it on demand", () => {
    const collapsed = buildCatalogEntries(tree, false);
    const expanded = buildCatalogEntries(tree, true);

    expect(collapsed[collapsed.length - 1]).toMatchObject({
      count: 2,
      expanded: false,
      kind: "archivedToggle",
    });
    expect(
      expanded.map((entry) => entry.kind === "row" && entry.row.node.id),
    ).toEqual(["alpha", "c1", "c2", "zeta", false, "gone", "c3"]);
  });

  it("SHOULD mark the last row and return nothing for no nodes", () => {
    const entries = buildCatalogEntries([node("a", "A")], false);

    expect(entries[0]).toMatchObject({ isLast: true });
    expect(buildCatalogEntries([], false)).toEqual([]);
  });
});

describe("nodesInScope", () => {
  const rows = [
    node("a", "A", { ownerId: "u" }),
    node("b", "B", { ownerId: "f" }),
    node("c", "C", { ownerId: "arch" }),
  ];

  it("SHOULD keep one owner, or every active owner for All", () => {
    expect(
      nodesInScope(rows, "f", "ALL", new Set(["arch"])).map((row) => row.id),
    ).toEqual(["b"]);
    expect(
      nodesInScope(rows, "ALL", "ALL", new Set(["arch"])).map((row) => row.id),
    ).toEqual(["a", "b"]);
    expect(
      nodesInScope(rows, "arch", "ALL", new Set(["arch"])).map((row) => row.id),
    ).toEqual(["c"]);
  });
});
