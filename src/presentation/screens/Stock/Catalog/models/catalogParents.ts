import { PATH_SEPARATOR } from "@screens/Stock/models/catalogTree";

import { CatalogNode } from "./catalogEntries";

const MAX_LEVELS = { category: 3, location: 2 } as const;

type CatalogKind = keyof typeof MAX_LEVELS;

interface ParentOption {
  label: string;
  value: string;
}

function findNode(nodes: CatalogNode[], id: string): CatalogNode | undefined {
  return walk(nodes).find((entry) => entry.node.id === id)?.node;
}

// Levels below a node (a leaf is 0), to check a re-parenting against the maximum depth.
function height(node: CatalogNode): number {
  return node.children.length === 0
    ? 0
    : 1 + Math.max(...node.children.map((child) => height(child)));
}

// FR 21/22: active nodes of the owner outside the subtree being deleted, as "Mover para" options.
function moveTargets(
  nodes: CatalogNode[],
  ownerId: string,
  deleting: CatalogNode,
): ParentOption[] {
  const excluded = new Set(subtreeIds(deleting));

  return walk(nodes)
    .filter(
      ({ node }) =>
        node.ownerId === ownerId &&
        node.status === "ACTIVE" &&
        !excluded.has(node.id),
    )
    .map(({ node, path }) => ({ label: path, value: node.id }));
}

// FR 6/7: the "Dentro de" options: ACTIVE nodes of the same owner, outside the subtree of the node being edited,
// that keep the whole subtree within the maximum depth ("Máximo de N níveis").
function parentOptions(
  nodes: CatalogNode[],
  kind: CatalogKind,
  ownerId: string,
  editing?: CatalogNode,
): ParentOption[] {
  const excluded = new Set(editing ? subtreeIds(editing) : []);
  const own = editing ? height(editing) : 0;

  return walk(nodes)
    .filter(
      ({ depth, node }) =>
        node.ownerId === ownerId &&
        node.status === "ACTIVE" &&
        !excluded.has(node.id) &&
        depth + 1 + own < MAX_LEVELS[kind],
    )
    .map(({ node, path }) => ({ label: path, value: node.id }));
}

// The color of the root of the tree `id` belongs to (itself when it is a root).
function rootColorOf(nodes: CatalogNode[], id: string): string | undefined {
  const byId = new Map(walk(nodes).map((entry) => [entry.node.id, entry.node]));
  let current = byId.get(id);

  while (current?.parentId && byId.has(current.parentId)) {
    current = byId.get(current.parentId);
  }

  return current?.color;
}

function subtreeIds(node: CatalogNode): string[] {
  return [node.id, ...node.children.flatMap((child) => subtreeIds(child))];
}

// Every node of the forest with its depth (0 = main), parents first.
function walk(
  nodes: CatalogNode[],
  depth = 0,
  prefix = "",
): Array<{ depth: number; node: CatalogNode; path: string }> {
  return nodes.flatMap((node) => {
    const path = prefix ? `${prefix}${PATH_SEPARATOR}${node.name}` : node.name;

    return [{ depth, node, path }, ...walk(node.children, depth + 1, path)];
  });
}

export type { CatalogKind, ParentOption };
export {
  findNode,
  height,
  MAX_LEVELS,
  moveTargets,
  parentOptions,
  rootColorOf,
  subtreeIds,
  walk,
};
