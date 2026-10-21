import { normalizeText } from "@application/csvImport/suggestColumns";

interface ChainCategory {
  depthLevel?: number;
  id: string;
  name: string;
  parentId?: string;
  scopeOwnerIds: string[];
  status: string;
}

interface ChainDeps {
  create: (params: {
    depthLevel: number;
    name: string;
    parentId?: string;
  }) => Promise<void>;
  // Fresh list of the owner's categories (the create refreshed the cache).
  list: () => Promise<ChainCategory[]>;
}

// Spec 047 FR 25: creates every level of the path that does not exist yet, top-down, reusing the ones that do
// (compared ignoring case and accents, active, in the owner). `first` is where the path starts (the parent chosen in
// the form, or none).
async function createCategoryChain(
  segments: string[],
  ownerId: string,
  first: { depthLevel: number; parentId?: string },
  deps: ChainDeps,
): Promise<void> {
  let parentId = first.parentId;
  let depth = first.depthLevel;
  let categories = await deps.list();

  for (const name of segments) {
    const wanted = normalizeText(name);
    const existing = categories.find(
      (item) =>
        item.status !== "ARCHIVED" &&
        item.parentId === parentId &&
        item.scopeOwnerIds.includes(ownerId) &&
        normalizeText(item.name) === wanted,
    );

    if (existing) {
      parentId = existing.id;
      depth = (existing.depthLevel ?? depth) + 1;
      continue;
    }

    await deps.create({ depthLevel: depth, name, parentId });
    categories = await deps.list();

    const created = categories.find(
      (item) =>
        item.parentId === parentId &&
        item.scopeOwnerIds.includes(ownerId) &&
        normalizeText(item.name) === wanted,
    );

    if (!created) {
      return;
    }
    parentId = created.id;
    depth += 1;
  }
}

// "Finanças > Investimentos > Renda fixa" (also `/` and `:`) → its levels, trimmed, empty ones dropped.
function splitCategoryPath(text: string): string[] {
  return text
    .split(/[>/:]/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

export type { ChainCategory };
export { createCategoryChain, splitCategoryPath };
