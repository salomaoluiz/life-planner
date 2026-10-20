import CategoryRowUIModel from "./CategoryRowUIModel";

export type CategoryEntry =
  | { count: number; expanded: boolean; key: string; kind: "archivedToggle" }
  | { isLast: boolean; key: string; kind: "row"; row: CategoryRowUIModel };

// Active tree first, then the collapsed "Archived (N)" group (spec 041 §8), like the Accounts screen.
function buildCategoryEntries(
  active: CategoryRowUIModel[],
  archived: CategoryRowUIModel[],
  archivedExpanded: boolean,
): CategoryEntry[] {
  const entries: CategoryEntry[] = toEntries(active);

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

function toEntries(rows: CategoryRowUIModel[]): CategoryEntry[] {
  return rows.map((row, index) => ({
    isLast: index === rows.length - 1,
    key: `row-${row.id}`,
    kind: "row",
    row,
  }));
}

export { buildCategoryEntries };
