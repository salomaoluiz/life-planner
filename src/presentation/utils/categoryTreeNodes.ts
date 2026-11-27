import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { TreeNode } from "@components";

const DEFAULT_NODE_ICON = "shape-outline";

interface CatalogNodeLike {
  children: CatalogNodeLike[];
  color: string;
  icon: string;
  id: string;
  itemCount?: number;
  name: string;
  parentId?: string;
  status: string;
}

// The active nodes of a stock category/location tree as flat picker nodes, parents first (spec 126).
function flattenCatalogNodes(nodes: CatalogNodeLike[]): TreeNode[] {
  return nodes
    .filter((node) => node.status === "ACTIVE")
    .flatMap((node) => [
      toTreeNode({ ...node, iconColor: node.color }),
      ...flattenCatalogNodes(node.children),
    ]);
}

// Up to `limit` active nodes with the most items, for the chips before "More…" (spec 126 FR 21).
function mostUsedCatalogIds(nodes: CatalogNodeLike[], limit = 6): string[] {
  const all: CatalogNodeLike[] = [];
  function collect(list: CatalogNodeLike[]) {
    list
      .filter((node) => node.status === "ACTIVE")
      .forEach((node) => {
        all.push(node);
        collect(node.children);
      });
  }

  collect(nodes);

  return all
    .filter((node) => (node.itemCount ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.itemCount ?? 0) - (a.itemCount ?? 0) || a.name.localeCompare(b.name),
    )
    .slice(0, limit)
    .map((node) => node.id);
}

// Anything shaped like a category (the import records, a stock category) as a picker node.
function toTreeNode(item: {
  icon?: string;
  iconColor?: string;
  id: string;
  name: string;
  parentId?: string;
}): TreeNode {
  return {
    color: item.iconColor ?? "",
    icon: item.icon ?? DEFAULT_NODE_ICON,
    id: item.id,
    name: item.name,
    parentId: item.parentId,
  };
}

// The generic picker nodes of the finance categories (spec 126).
function toTreeNodes(
  categories: CategoryDTO[],
  badgeOf?: (category: CategoryDTO) => string | undefined,
): TreeNode[] {
  return categories.map((category) => ({
    archived: category.status === "ARCHIVED",
    badge: badgeOf?.(category),
    color: category.iconColor,
    icon: category.icon,
    id: category.id,
    name: category.name,
    parentId: category.parentId,
  }));
}

export { flattenCatalogNodes, mostUsedCatalogIds, toTreeNode, toTreeNodes };
