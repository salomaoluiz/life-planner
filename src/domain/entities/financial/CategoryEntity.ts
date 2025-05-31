import { OwnerType } from "@domain/entities/user/OwnerEntity";

interface ICategoryEntity {
  depthLevel: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
}

class CategoryEntity {
  depthLevel: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;

  constructor(params: ICategoryEntity) {
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.name = params.name;
    this.icon = params.icon;
    this.parentId = params.parentId;
    this.depthLevel = params.depthLevel;
  }
}

export default CategoryEntity;
