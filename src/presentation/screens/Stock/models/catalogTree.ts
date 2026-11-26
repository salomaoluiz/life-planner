interface CatalogTreeNode {
  children: CatalogTreeNode[];
  id: string;
  name: string;
  parentId?: string;
  status: string;
}

interface FlatCatalogNode {
  id: string;
  // "Cozinha › Geladeira".
  label: string;
  parentId?: string;
}

const PATH_SEPARATOR = " › ";

// Spec 125: active categories and locations as a flat list with their path, parents first.
function flattenActive(
  nodes: CatalogTreeNode[],
  prefix = "",
): FlatCatalogNode[] {
  return nodes
    .filter((node) => node.status === "ACTIVE")
    .flatMap((node) => {
      const label = prefix
        ? `${prefix}${PATH_SEPARATOR}${node.name}`
        : node.name;

      return [
        { id: node.id, label, parentId: node.parentId },
        ...flattenActive(node.children, label),
      ];
    });
}

export type { CatalogTreeNode, FlatCatalogNode };
export { flattenActive, PATH_SEPARATOR };
