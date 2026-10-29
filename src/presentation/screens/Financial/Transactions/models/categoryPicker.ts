export type CategoryCheckState = "mixed" | boolean;

export interface CategoryGroup {
  kind: "ARCHIVED" | "EXPENSE" | "INCOME";
  nodes: CategoryNode[];
}

export interface CategoryNode {
  category: PickerCategory;
  children: CategoryNode[];
  depth: number;
}

export interface CategoryResult {
  // Name of the selected ancestor that already includes this category (spec 051 FR 9).
  coveredBy?: string;
  entry: CategorySearchEntry;
}

// One searchable row, normalized once per categories load (spec 051 §11).
export interface CategorySearchEntry {
  category: PickerCategory;
  childCount: number;
  descendantCount: number;
  haystack: string;
  path: string;
  pathNames: string[];
}

// The category tree of the Filters modal (spec 045 FR 1/18). Choosing a category includes its subcategories,
// so the selection keeps only the ids the user chose and the state of a row is derived from them.
export interface PickerCategory {
  archived: boolean;
  color?: string;
  id: string;
  name: string;
  parentId?: string;
  type: string;
}

export interface SearchOptions {
  selected: ReadonlySet<string>;
  typeFirst?: "EXPENSE" | "INCOME";
}

const MAX_RESULTS = 8;

const GROUP_ORDER: CategoryGroup["kind"][] = ["EXPENSE", "INCOME", "ARCHIVED"];

// Expenses, then Income, then the archived ones; roots whose parent is missing are shown as roots.
// With a query only the matching rows and the parents that lead to them stay.
function buildCategoryGroups(
  categories: PickerCategory[],
  query = "",
): CategoryGroup[] {
  const ids = new Set(categories.map((category) => category.id));
  const needle = normalize(query);
  const childrenOf = new Map<string, PickerCategory[]>();
  const roots: PickerCategory[] = [];

  categories.forEach((category) => {
    if (category.parentId && ids.has(category.parentId)) {
      childrenOf.set(category.parentId, [
        ...(childrenOf.get(category.parentId) ?? []),
        category,
      ]);
    } else {
      roots.push(category);
    }
  });

  function toNode(
    category: PickerCategory,
    depth: number,
  ): CategoryNode | null {
    const children = (childrenOf.get(category.id) ?? [])
      .map((child) => toNode(child, depth + 1))
      .filter((node): node is CategoryNode => node !== null);
    const matches = !needle || normalize(category.name).includes(needle);

    return matches || children.length > 0
      ? { category, children, depth }
      : null;
  }

  const groups = GROUP_ORDER.map((kind) => ({
    kind,
    nodes: roots
      .filter((root) =>
        kind === "ARCHIVED"
          ? root.archived
          : !root.archived && root.type === kind,
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((root) => toNode(root, 0))
      .filter((node): node is CategoryNode => node !== null),
  }));

  return groups.filter((group) => group.nodes.length > 0);
}

// The search index: the path is "Parent › Name" for a child and the name for a root.
function buildCategoryIndex(
  categories: PickerCategory[],
): CategorySearchEntry[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const children = new Map<string, string[]>();

  categories.forEach((category) => {
    if (category.parentId && byId.has(category.parentId)) {
      children.set(category.parentId, [
        ...(children.get(category.parentId) ?? []),
        category.id,
      ]);
    }
  });

  function countBelow(id: string): number {
    return (children.get(id) ?? []).reduce(
      (total, child) => total + 1 + countBelow(child),
      0,
    );
  }

  return categories.map((category) => {
    const parent = category.parentId ? byId.get(category.parentId) : undefined;
    const pathNames = parent ? [parent.name, category.name] : [category.name];

    return {
      category,
      childCount: children.get(category.id)?.length ?? 0,
      descendantCount: countBelow(category.id),
      haystack: normalize(pathNames.join(" ")),
      path: pathNames.join(" › "),
      pathNames,
    };
  });
}

function checkState(
  node: CategoryNode,
  selected: ReadonlySet<string>,
  ancestorChosen = false,
): CategoryCheckState {
  if (ancestorChosen || selected.has(node.category.id)) {
    return true;
  }

  return descendantIds(node).some((id) => selected.has(id)) ? "mixed" : false;
}

// The selected ancestor (any level) that already includes the category.
function coveringAncestorName(
  index: CategorySearchEntry[],
  selected: ReadonlySet<string>,
  id: string,
): string | undefined {
  const byId = new Map(index.map((entry) => [entry.category.id, entry]));
  let parentId = byId.get(id)?.category.parentId;

  while (parentId) {
    const parent = byId.get(parentId);

    if (!parent) {
      return undefined;
    }
    if (selected.has(parentId)) {
      return parent.category.name;
    }
    parentId = parent.category.parentId;
  }

  return undefined;
}

// Every descendant id of a node.
function descendantIds(node: CategoryNode): string[] {
  return node.children.flatMap((child) => [
    child.category.id,
    ...descendantIds(child),
  ]);
}

function findPath(
  groups: CategoryGroup[],
  id: string,
): CategoryNode[] | undefined {
  function walk(
    nodes: CategoryNode[],
    trail: CategoryNode[],
  ): CategoryNode[] | undefined {
    for (const node of nodes) {
      const next = [...trail, node];

      if (node.category.id === id) {
        return next;
      }

      const found = walk(node.children, next);

      if (found) {
        return found;
      }
    }

    return undefined;
  }

  return walk(
    groups.flatMap((group) => group.nodes),
    [],
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Contains-match on the name and the parent's name; the type of the screen first, then by name; at most 8.
function searchCategories(
  index: CategorySearchEntry[],
  query: string,
  options: SearchOptions,
): CategoryResult[] {
  const needle = normalize(query);

  if (!needle) {
    return [];
  }

  const first = options.typeFirst ?? "EXPENSE";

  return index
    .filter(
      (entry) =>
        !options.selected.has(entry.category.id) &&
        entry.haystack.includes(needle),
    )
    .sort(
      (a, b) =>
        Number(b.category.type === first) - Number(a.category.type === first) ||
        a.category.name.localeCompare(b.category.name),
    )
    .slice(0, MAX_RESULTS)
    .map((entry) => ({
      coveredBy: coveringAncestorName(
        index,
        options.selected,
        entry.category.id,
      ),
      entry,
    }));
}

// Adding a row drops the redundant ids under it; removing a row that is covered by a chosen ancestor
// swaps that ancestor for the siblings along the path.
function toggleCategory(
  groups: CategoryGroup[],
  selected: ReadonlySet<string>,
  id: string,
): string[] {
  const path = findPath(groups, id);

  if (!path) {
    return [...selected];
  }

  const target = path[path.length - 1];
  const chosenIndex = path.findIndex((node) => selected.has(node.category.id));

  if (chosenIndex === -1) {
    const next = new Set(selected);

    descendantIds(target).forEach((child) => next.delete(child));
    next.add(id);

    return [...next];
  }

  const next = new Set(selected);

  next.delete(path[chosenIndex].category.id);
  // Keep every sibling along the way from the chosen ancestor down to the toggled row.
  for (let index = chosenIndex; index < path.length - 1; index += 1) {
    path[index].children
      .filter((child) => child.category.id !== path[index + 1].category.id)
      .forEach((child) => next.add(child.category.id));
  }
  next.delete(id);

  return [...next];
}

export {
  buildCategoryGroups,
  buildCategoryIndex,
  checkState,
  coveringAncestorName,
  descendantIds,
  normalize,
  searchCategories,
  toggleCategory,
};
