import TagDTO from "@application/dto/financial/TagDTO";

interface TagRow {
  id: string;
  isAll: boolean;
  name: string;
  ownerId: string;
  usageCount: number;
}

// One list sorted by name, case-insensitive (spec 043 FR 5).
function buildTagRows(tags: TagDTO[]): TagRow[] {
  return [...tags]
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map((tag) => ({
      id: tag.id,
      isAll: tag.scope === "ALL",
      name: tag.name,
      ownerId: tag.ownerId,
      usageCount: tag.usageCount,
    }));
}

// "All" skips a tag that only lives in archived families (spec 042); an All tag stays through its other scopes.
function tagInActiveScope(tag: TagDTO, archivedOwnerIds: ReadonlySet<string>) {
  return (
    tag.scopeOwnerIds.length === 0 ||
    tag.scopeOwnerIds.some((id) => !archivedOwnerIds.has(id))
  );
}

// An All tag belongs to several scopes: the Personal one and each family of its creator.
function tagInScope(tag: TagDTO, ownerId: string) {
  return tag.scopeOwnerIds.includes(ownerId);
}

export type { TagRow };
export { buildTagRows, tagInActiveScope, tagInScope };
