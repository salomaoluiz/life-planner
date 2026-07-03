import CategoryEntity from "@domain/entities/financial/CategoryEntity";

export interface ICategoryDTO {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  type: string;
}

class CategoryDTO {
  depthLevel?: number;
  icon: string;
  iconColor: string;
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  type: string;

  constructor(params: ICategoryDTO) {
    this.depthLevel = params.depthLevel;
    this.icon = params.icon;
    this.iconColor = params.iconColor ?? "black";
    this.id = params.id;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.parentId = params.parentId;
    this.type = params.type;
  }

  static fromEntity(entity: CategoryEntity) {
    return new CategoryDTO({
      depthLevel: entity.depthLevel,
      icon: entity.icon,
      iconColor: entity.iconColor,
      id: entity.id,
      name: entity.name,
      owner: entity.owner,
      ownerId: entity.ownerId,
      parentId: entity.parentId,
      type: entity.type,
    });
  }
}

export default CategoryDTO;
