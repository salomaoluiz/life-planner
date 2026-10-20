// The `{ id, name }` a transaction carries.
export interface TagRefModel {
  id: string;
  name: string;
}

interface ITagModel {
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  scope?: TagScope;
  scopes?: TagScopeModel[];
  usageCount?: number;
}
// Same values as the transaction model owner type (not imported: TransactionModel imports this file).
type OwnerType = "FAMILY" | "USER";

type TagScope = "ALL" | "FAMILY" | "PERSONAL";

interface TagScopeModel {
  owner: OwnerType;
  ownerId: string;
}

class TagModel implements ITagModel {
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  scope: TagScope;
  scopes: TagScopeModel[];
  usageCount: number;

  constructor(params: ITagModel) {
    this.id = params.id;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.scope =
      params.scope ?? (params.owner === "FAMILY" ? "FAMILY" : "PERSONAL");
    this.scopes = params.scopes ?? [
      { owner: params.owner, ownerId: params.ownerId },
    ];
    this.usageCount = params.usageCount ?? 0;
  }

  static fromJSON(data: Record<string, unknown>): TagModel {
    return new TagModel({
      id: data.id as string,
      name: data.name as string,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      scope: data.scope as TagScope | undefined,
      scopes: Array.isArray(data.scopes)
        ? (data.scopes as TagScopeModel[]).map((scope) => ({
            owner: scope.owner,
            ownerId: scope.ownerId,
          }))
        : undefined,
      usageCount: typeof data.usageCount === "number" ? data.usageCount : 0,
    });
  }

  // Same shape as the API: also what the repository cache stores.
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      owner: this.owner,
      ownerId: this.ownerId,
      scope: this.scope,
      scopes: this.scopes,
      usageCount: this.usageCount,
    };
  }
}

// `tags` of a transaction / series response; anything malformed is dropped.
export function tagRefsFromJSON(value: unknown): TagRefModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return (value as Record<string, unknown>[]).map((tag) => ({
    id: tag.id as string,
    name: tag.name as string,
  }));
}

export type { TagScope, TagScopeModel };
export default TagModel;
