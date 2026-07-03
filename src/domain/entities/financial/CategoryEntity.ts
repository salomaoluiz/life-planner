import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum CategoryType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}

interface ICategoryEntity {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
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
    this.type = params.type;
  }
}

export default CategoryEntity;
