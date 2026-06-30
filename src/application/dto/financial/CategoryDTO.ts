import CategoryEntity from "@domain/entities/financial/CategoryEntity";

export interface ICategoryDTO {
  depthLevel?: number;
  icon: string;
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
}

class CategoryDTO {
  depthLevel?: number;
  icon: string;
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;

  constructor(params: ICategoryDTO) {
    this.depthLevel = params.depthLevel;
    this.icon = params.icon;
    this.id = params.id;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.parentId = params.parentId;
  }

  static fromEntity(entity: CategoryEntity) {
    return new CategoryDTO({
      depthLevel: entity.depthLevel,
      icon: entity.icon,
      id: entity.id,
      name: entity.name,
      owner: entity.owner,
      ownerId: entity.ownerId,
      parentId: entity.parentId,
    });
  }
}

export default CategoryDTO;
