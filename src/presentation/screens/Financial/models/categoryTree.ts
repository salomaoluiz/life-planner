import CategoryDTO from "@application/dto/financial/CategoryDTO";

export interface CategoryTreeRow {
  category: CategoryDTO;
  childCount: number;
  depth: number;
}

function buildCategoryRows(categories: CategoryDTO[]): CategoryTreeRow[] {
  const { childrenOf, roots } = groupChildren(categories);
  const rows: CategoryTreeRow[] = [];
  const visited = new Set<string>();

  function visit(category: CategoryDTO, depth: number) {
    if (visited.has(category.id)) {
      return;
    }
    visited.add(category.id);

    const children = [...(childrenOf.get(category.id) ?? [])].sort(byName);
    rows.push({ category, childCount: children.length, depth });
    children.forEach((child) => visit(child, depth + 1));
  }

  [...roots].sort(byName).forEach((root) => visit(root, 0));
  // Categories that sit in a parent cycle are unreachable from a root: show them as roots.
  categories
    .filter((category) => !visited.has(category.id))
    .sort(byName)
    .forEach((category) => visit(category, 0));

  return rows;
}

function byName(a: CategoryDTO, b: CategoryDTO) {
  return a.name.localeCompare(b.name);
}

function categoriesOf(
  categories: CategoryDTO[],
  ownerId: string,
  type: string,
) {
  return categories.filter(
    (category) => category.ownerId === ownerId && category.type === type,
  );
}

function descendantIds(categories: CategoryDTO[], id: string): Set<string> {
  const { childrenOf } = groupChildren(categories);
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

function filterRowsByQuery(rows: CategoryTreeRow[], query: string) {
  const needle = normalize(query.trim());

  return needle
    ? rows.filter((row) => normalize(row.category.name).includes(needle))
    : rows;
}

function groupChildren(categories: CategoryDTO[]) {
  const ids = new Set(categories.map((category) => category.id));
  const childrenOf = new Map<string, CategoryDTO[]>();
  const roots: CategoryDTO[] = [];

  categories.forEach((category) => {
    if (
      category.parentId &&
      category.parentId !== category.id &&
      ids.has(category.parentId)
    ) {
      childrenOf.set(category.parentId, [
        ...(childrenOf.get(category.parentId) ?? []),
        category,
      ]);
    } else {
      roots.push(category);
    }
  });

  return { childrenOf, roots };
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export { buildCategoryRows, categoriesOf, descendantIds, filterRowsByQuery };
