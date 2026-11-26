import { compareNames } from "./catalogTone";

type CatalogEntry =
  | { count: number; expanded: boolean; key: string; kind: "archivedToggle" }
  | { isLast: boolean; key: string; kind: "row"; row: CatalogRow };

// A node of a category or location tree, as the screen reads both (spec 125).
interface CatalogNode {
  children: CatalogNode[];
  color: string;
  effectiveFinanceCategoryId?: string;
  financeCategoryId?: string;
  icon: string;
  id: string;
  itemCount: number;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  status: string;
}

interface CatalogRow {
  depth: number;
  hasChildren: boolean;
  isArchived: boolean;
  node: CatalogNode;
  // Only parents show "N subcategorias / sub-locais" (the active children).
  subcount: number;
}

const ACTIVE = "ACTIVE";

// FR 5: the active tree alphabetically (parents first, children under each parent), then every archived row in a
// collapsible group at the end.
function buildCatalogEntries(
  nodes: CatalogNode[],
  archivedExpanded: boolean,
): CatalogEntry[] {
  const active = flattenActive(nodes, 0);
  const archived = flattenArchived(nodes).sort((a, b) =>
    compareNames(a.node.name, b.node.name),
  );
  const entries = toEntries(active);

  if (archived.length > 0) {
    entries.push({
      count: archived.length,
      expanded: archivedExpanded,
      key: "archived-toggle",
      kind: "archivedToggle",
    });

    if (archivedExpanded) {
      entries.push(...toEntries(archived));
    }
  }

  return entries;
}

function flattenActive(nodes: CatalogNode[], depth: number): CatalogRow[] {
  return [...nodes]
    .filter((node) => node.status === ACTIVE)
    .sort((a, b) => compareNames(a.name, b.name))
    .flatMap((node) => {
      const children = node.children.filter((child) => child.status === ACTIVE);

      return [
        {
          depth,
          hasChildren: children.length > 0,
          isArchived: false,
          node,
          subcount: children.length,
        },
        ...flattenActive(node.children, depth + 1),
      ];
    });
}

function flattenArchived(nodes: CatalogNode[]): CatalogRow[] {
  return nodes.flatMap((node) => [
    ...(node.status === ACTIVE
      ? []
      : [
          {
            depth: 0,
            hasChildren: false,
            isArchived: true,
            node,
            subcount: 0,
          },
        ]),
    ...flattenArchived(node.children),
  ]);
}

// A tab shows the nodes of one owner, or of every active owner ("Todos"); archived families are skipped there.
function nodesInScope(
  nodes: CatalogNode[],
  ownerFilter: string,
  allValue: string,
  archivedOwnerIds: ReadonlySet<string>,
): CatalogNode[] {
  return nodes.filter((node) =>
    ownerFilter === allValue
      ? !archivedOwnerIds.has(node.ownerId)
      : node.ownerId === ownerFilter,
  );
}

function toEntries(rows: CatalogRow[]): CatalogEntry[] {
  return rows.map((row, index) => ({
    isLast: index === rows.length - 1,
    key: `row-${row.node.id}`,
    kind: "row",
    row,
  }));
}

export type { CatalogEntry, CatalogNode, CatalogRow };
export { buildCatalogEntries, nodesInScope };
