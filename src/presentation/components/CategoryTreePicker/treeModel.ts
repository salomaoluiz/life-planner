export interface TreeNode {
  archived?: boolean;
  badge?: string;
  color: string;
  icon: string;
  id: string;
  name: string;
  parentId?: string;
}

export interface TreeRow {
  depth: number;
  node: TreeNode;
  path: string[];
}

function buildTreeRows(nodes: TreeNode[]): TreeRow[] {
  const { childrenOf, roots } = groupChildren(nodes);
  const rows: TreeRow[] = [];
  const visited = new Set<string>();

  function visit(item: TreeNode, depth: number, path: string[]) {
    if (visited.has(item.id)) {
      return;
    }
    visited.add(item.id);
    const own = [...path, item.name];

    rows.push({ depth, node: item, path: own });
    [...(childrenOf.get(item.id) ?? [])]
      .sort(byName)
      .forEach((child) => visit(child, depth + 1, own));
  }

  [...roots].sort(byName).forEach((root) => visit(root, 0, []));
  // Nodes in a parent cycle are unreachable from a root: show them as roots.
  nodes
    .filter((item) => !visited.has(item.id))
    .sort(byName)
    .forEach((item) => visit(item, 0, []));

  return rows;
}

function byName(a: TreeNode, b: TreeNode) {
  return a.name.localeCompare(b.name);
}

// Two columns of root groups balanced by rows; a root and its descendants stay together.
function columnSplit(rows: TreeRow[]): [TreeRow[], TreeRow[]] {
  const groups: TreeRow[][] = [];

  rows.forEach((row) => {
    if (row.depth === 0 || groups.length === 0) {
      groups.push([row]);
    } else {
      groups[groups.length - 1].push(row);
    }
  });

  const half = rows.length / 2;
  const left: TreeRow[] = [];
  const right: TreeRow[] = [];

  groups.forEach((group) => {
    if (left.length === 0 || left.length + group.length / 2 <= half) {
      left.push(...group);
    } else {
      right.push(...group);
    }
  });

  return [left, right];
}

function descendantIdsOf(nodes: TreeNode[], id: string): Set<string> {
  const { childrenOf } = groupChildren(nodes);
  const result = new Set<string>();
  const pending = [id];

  while (pending.length) {
    const current = pending.pop() as string;

    (childrenOf.get(current) ?? []).forEach((child) => {
      if (child.id !== id && !result.has(child.id)) {
        result.add(child.id);
        pending.push(child.id);
      }
    });
  }

  return result;
}

// Spec 126 FR 10-12: for each match keep its ancestors, itself and descendants, its siblings and their
// descendants; never the siblings of an ancestor. A root match has no siblings for this rule.
function filterTreeByQuery(nodes: TreeNode[], query: string): TreeNode[] {
  const needle = normalize(query.trim());

  if (!needle) {
    return nodes;
  }
  const byId = new Map(nodes.map((item) => [item.id, item]));
  const { childrenOf } = groupChildren(nodes);
  const keep = new Set<string>();

  function addSubtree(id: string) {
    keep.add(id);
    descendantIdsOf(nodes, id).forEach((child) => keep.add(child));
  }

  nodes
    .filter((item) => normalize(item.name).includes(needle))
    .forEach((match) => {
      addSubtree(match.id);

      const seen = new Set([match.id]);
      let parent = match.parentId ? byId.get(match.parentId) : undefined;

      while (parent && !seen.has(parent.id)) {
        seen.add(parent.id);
        keep.add(parent.id);
        parent = parent.parentId ? byId.get(parent.parentId) : undefined;
      }

      const parentId = match.parentId;

      if (parentId && byId.has(parentId) && parentId !== match.id) {
        (childrenOf.get(parentId) ?? []).forEach((sibling) =>
          addSubtree(sibling.id),
        );
      }
    });

  return nodes.filter((item) => keep.has(item.id));
}

// A missing parent, a self parent or a cycle makes the node a root, as the finance tree does.
function groupChildren(nodes: TreeNode[]) {
  const ids = new Set(nodes.map((item) => item.id));
  const childrenOf = new Map<string, TreeNode[]>();
  const roots: TreeNode[] = [];

  nodes.forEach((item) => {
    if (item.parentId && item.parentId !== item.id && ids.has(item.parentId)) {
      childrenOf.set(item.parentId, [
        ...(childrenOf.get(item.parentId) ?? []),
        item,
      ]);
    } else {
      roots.push(item);
    }
  });

  return { childrenOf, roots };
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Archived nodes are never offered; the ones already chosen stay so an old record can show its value.
function visibleNodes(nodes: TreeNode[], currentIds: string[] = []) {
  return nodes.filter((item) => !item.archived || currentIds.includes(item.id));
}

export {
  buildTreeRows,
  columnSplit,
  descendantIdsOf,
  filterTreeByQuery,
  visibleNodes,
};
