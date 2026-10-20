import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum CategoryType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}
// What a category is created for: one owner or every scope.
export type CategoryOwner = "ALL" | OwnerType;

// Spec 038: "ALL" belongs to the Personal scope and every family of its creator.
export type CategoryScope = "ALL" | "FAMILY" | "PERSONAL";

interface ICategoryEntity {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
  scope?: CategoryScope;
  scopeOwnerIds?: string[];
  type: CategoryType;
}

class CategoryEntity {
  depthLevel?: number;
  icon: string;
  iconColor: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
  scope: CategoryScope;
  // Owner ids (Personal user id, family ids) the category belongs to; one entry unless the scope is ALL.
  scopeOwnerIds: string[];
  type: CategoryType;

  constructor(params: ICategoryEntity) {
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.name = params.name;
    this.icon = params.icon;
    this.iconColor = params.iconColor ?? "black";
    this.parentId = params.parentId;
    this.depthLevel = params.depthLevel;
    this.scope =
      params.scope ??
      (params.owner === OwnerType.FAMILY ? "FAMILY" : "PERSONAL");
    this.scopeOwnerIds = params.scopeOwnerIds ?? [params.ownerId];
    this.type = params.type;
  }
}

export default CategoryEntity;
