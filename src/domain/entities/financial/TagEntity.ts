import { OwnerType } from "@domain/entities/user/OwnerEntity";

// What a tag is created for: one owner or every scope.
export type TagOwner = "ALL" | OwnerType;

// The `{ id, name }` pair a transaction carries, in the stored order.
export interface TagRefEntity {
  id: string;
  name: string;
}

// Same model as categories: "ALL" belongs to the Personal scope and every family of its creator.
export type TagScope = "ALL" | "FAMILY" | "PERSONAL";

interface ITagEntity {
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  scope?: TagScope;
  scopeOwnerIds?: string[];
  usageCount?: number;
}

class TagEntity {
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  scope: TagScope;
  // Owner ids (Personal user id, family ids) the tag belongs to; one entry unless the scope is ALL.
  scopeOwnerIds: string[];
  // Transactions plus recurrences that use the tag, in the owners that were asked for.
  usageCount: number;

  constructor(params: ITagEntity) {
    this.id = params.id;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.scope =
      params.scope ??
      (params.owner === OwnerType.FAMILY ? "FAMILY" : "PERSONAL");
    this.scopeOwnerIds = params.scopeOwnerIds ?? [params.ownerId];
    this.usageCount = params.usageCount ?? 0;
  }
}

export default TagEntity;
