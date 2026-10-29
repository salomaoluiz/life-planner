import {
  ImportRecords,
  ValueChoices,
  ValueEntry,
} from "@screens/Financial/Transactions/models/importValues";

// Spec 054 FR 4: a category the wizard created in this run, and the owner it belongs to.
interface CreatedCategory {
  id: string;
  ownerId: string;
}

interface CreatedListItem {
  childCount: number;
  depth: number;
  iconColor: string;
  id: string;
  ownerId: string;
  path: string;
  type: RecordCategory["type"];
  valuesCount: number;
}

interface DeletionPlan {
  // The category entries that are matched to any deleted id: they go back to no match (FR 8).
  affectedValues: ValueEntry[];
  // The category and every descendant: what the API deletes (the subtree).
  ids: string[];
  // Names of the descendants, listed in the confirmation (FR 7).
  names: string[];
  path: string;
}

type RecordCategory = ImportRecords["categories"][number];

function addCreated(
  list: CreatedCategory[],
  ownerId: string,
  ids: string[],
): CreatedCategory[] {
  const known = new Set(list.map((item) => item.id));

  return [
    ...list,
    ...ids.filter((id) => !known.has(id)).map((id) => ({ id, ownerId })),
  ];
}

// The "Created in this import" list: only categories still known to the catalog, in the order they were created.
function createdList(
  created: CreatedCategory[],
  catalog: Record<string, ImportRecords>,
  entries: ValueEntry[],
): CreatedListItem[] {
  return created.flatMap((item) => {
    const categories = catalog[item.ownerId]?.categories ?? [];
    const found = categories.find((category) => category.id === item.id);

    if (!found) {
      return [];
    }

    return [
      {
        childCount: categories.filter((child) => child.parentId === item.id)
          .length,
        depth: found.path.split(" > ").length - 1,
        iconColor: found.iconColor,
        id: item.id,
        ownerId: item.ownerId,
        path: found.path,
        type: found.type,
        valuesCount: entries.filter((entry) => entry.selected === item.id)
          .length,
      },
    ];
  });
}

function deletionPlan(
  id: string,
  categories: RecordCategory[],
  entries: ValueEntry[],
): DeletionPlan {
  const descendants = descendantsOf(id, categories);
  const ids = [id, ...descendants];

  return {
    affectedValues: entries.filter(
      (entry) => entry.selected !== undefined && ids.includes(entry.selected),
    ),
    ids,
    names: descendants.map(
      (child) => categories.find((item) => item.id === child)?.name ?? "",
    ),
    path: categories.find((item) => item.id === id)?.path ?? "",
  };
}

function descendantsOf(
  id: string,
  categories: { id: string; parentId?: string }[],
): string[] {
  const found: string[] = [];
  let frontier = [id];

  while (frontier.length > 0) {
    const next = categories
      .filter(
        (item) =>
          item.parentId !== undefined &&
          frontier.includes(item.parentId) &&
          !found.includes(item.id),
      )
      .map((item) => item.id);

    found.push(...next);
    frontier = next;
  }

  return found;
}

function removeCreated(
  list: CreatedCategory[],
  ids: string[],
): CreatedCategory[] {
  return list.filter((item) => !ids.includes(item.id));
}

// Every value matched to one of the deleted categories goes back to no match; the others keep their match.
function unmatchCategories(choices: ValueChoices, ids: string[]): ValueChoices {
  const category = Object.fromEntries(
    Object.entries(choices.category ?? {}).filter(
      ([, selected]) => !ids.includes(selected),
    ),
  );

  return { ...choices, category };
}

export type { CreatedCategory, CreatedListItem, DeletionPlan };
export {
  addCreated,
  createdList,
  deletionPlan,
  descendantsOf,
  removeCreated,
  unmatchCategories,
};
