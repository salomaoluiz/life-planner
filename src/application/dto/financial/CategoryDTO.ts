import CategoryEntity, {
  CategoryScope,
  CategoryStatus,
} from "@domain/entities/financial/CategoryEntity";

export interface ICategoryDTO {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  parentId?: string;
  scope?: CategoryScope;
  scopeOwnerIds?: string[];
  status?: CategoryStatus;
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
  scope: CategoryScope;
  scopeOwnerIds: string[];
  status: CategoryStatus;
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
    this.scope = params.scope ?? "PERSONAL";
    this.scopeOwnerIds = params.scopeOwnerIds ?? [params.ownerId];
    this.status = params.status ?? "ACTIVE";
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
      scope: entity.scope,
      scopeOwnerIds: entity.scopeOwnerIds,
      status: entity.status,
      type: entity.type,
    });
  }
}

export default CategoryDTO;
