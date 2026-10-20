import { fromApiColor, toApiColor } from "./iconColor";
import { OwnerType } from "./TransactionModel";

type CategoryScope = "ALL" | "FAMILY" | "PERSONAL";

interface CategoryScopeModel {
  owner: OwnerType;
  ownerId: string;
}

interface ICategoryModel {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
  scope?: CategoryScope;
  scopes?: CategoryScopeModel[];
  type: string;
}

class CategoryModel implements ICategoryModel {
  depthLevel?: number;
  icon: string;
  iconColor: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
  scope: CategoryScope;
  scopes: CategoryScopeModel[];
  type: string;

  constructor(params: ICategoryModel) {
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.name = params.name;
    this.icon = params.icon;
    this.iconColor = params.iconColor ?? "black";
    this.parentId = params.parentId;
    this.depthLevel = params.depthLevel;
    this.scope =
      params.scope ?? (params.owner === "FAMILY" ? "FAMILY" : "PERSONAL");
    this.scopes = params.scopes ?? [
      { owner: params.owner, ownerId: params.ownerId },
    ];
    this.type = params.type;
  }

  static fromJSON(data: Record<string, unknown>): CategoryModel {
    return new CategoryModel({
      depthLevel:
        data.depthLevel !== undefined && data.depthLevel !== null
          ? Number(data.depthLevel)
          : undefined,
      icon: data.icon as string,
      iconColor: fromApiColor(data.iconColor),
      id: data.id as string,
      name: data.name as string,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      parentId:
        data.parentId !== undefined && data.parentId !== null
          ? String(data.parentId)
          : undefined,
      scope: data.scope as CategoryScope | undefined,
      scopes: Array.isArray(data.scopes)
        ? (data.scopes as CategoryScopeModel[]).map((scope) => ({
            owner: scope.owner,
            ownerId: scope.ownerId,
          }))
        : undefined,
      type: (data.type as string) ?? "EXPENSE",
    });
  }

  // Same shape as the API: also what the repository cache stores.
  toJSON() {
    return {
      depthLevel: this.depthLevel,
      icon: this.icon,
      iconColor: toApiColor(this.iconColor),
      id: this.id,
      name: this.name,
      owner: this.owner,
      ownerId: this.ownerId,
      parentId: this.parentId ?? null,
      scope: this.scope,
      scopes: this.scopes,
      type: this.type,
    };
  }
}

export type { CategoryScope, CategoryScopeModel };
export default CategoryModel;
