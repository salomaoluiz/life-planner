import { normalizeText } from "@application/csvImport/suggestColumns";
import {
  childColor,
  pickRootColor,
} from "@screens/Financial/models/categoryColorPicker";

interface ChainCategory {
  depthLevel?: number;
  iconColor: string;
  id: string;
  name: string;
  parentId?: string;
  // "ALL" for a category of Personal and every family (spec 038).
  scope?: string;
  scopeOwnerIds: string[];
  status: string;
  type: string;
}

interface ChainCreated {
  id: string;
  name: string;
  parentId?: string;
}

interface ChainDeps {
  create: (params: {
    // Set for an All category (spec 048 FR 29b).
    all?: boolean;
    depthLevel: number;
    // Spec 054 FR 14: a root gets a palette color, a child the tone of its siblings or a new tone of the root.
    iconColor: string;
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
  // "ALL" (spec 048 FR 29b): every level is an All category and only All categories are reused. With "OWNER" a reused
  // All parent still makes its children All: a child follows the scope of its parent (spec 038).
  scope: "ALL" | "OWNER" = "OWNER",
  // Spec 054 FR 1-2: an income and an expense category can share a name, so levels are matched inside the same type.
  type: string,
): Promise<ChainCreated[]> {
  const createdLevels: ChainCreated[] = [];
  let all = scope === "ALL";
  let parentId = first.parentId;
  let depth = first.depthLevel;
  let categories = await deps.list();

  for (const name of segments) {
    const wanted = normalizeText(name);
    const existing = categories.find(
      (item) =>
        item.status !== "ARCHIVED" &&
        item.parentId === parentId &&
        item.type === type &&
        item.scopeOwnerIds.includes(ownerId) &&
        (scope !== "ALL" || item.scope === "ALL") &&
        normalizeText(item.name) === wanted,
    );

    if (existing) {
      all = existing.scope === "ALL";
      parentId = existing.id;
      depth = (existing.depthLevel ?? depth) + 1;
      continue;
    }

    const iconColor = parentId
      ? childColor(parentId, categories)
      : pickRootColor(
          categories
            .filter(
              (item) =>
                !item.parentId &&
                item.status !== "ARCHIVED" &&
                item.scopeOwnerIds.includes(ownerId),
            )
            .map((item) => item.iconColor),
        );

    await deps.create({
      ...(all ? { all: true } : {}),
      depthLevel: depth,
      iconColor,
      name,
      parentId,
    });
    categories = await deps.list();

    const created = categories.find(
      (item) =>
        item.parentId === parentId &&
        item.type === type &&
        item.scopeOwnerIds.includes(ownerId) &&
        normalizeText(item.name) === wanted,
    );

    if (!created) {
      return createdLevels;
    }
    createdLevels.push({
      id: created.id,
      name: created.name,
      parentId: created.parentId,
    });
    parentId = created.id;
    depth += 1;
  }

  return createdLevels;
}

// "Finanças > Investimentos > Renda fixa" (also `/` and `:`) → its levels, trimmed, empty ones dropped.
function splitCategoryPath(text: string): string[] {
  return text
    .split(/[>/:]/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

export type { ChainCategory, ChainCreated };
export { createCategoryChain, splitCategoryPath };
