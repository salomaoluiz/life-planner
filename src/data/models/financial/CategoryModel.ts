import { OwnerType } from "./TransactionModel";

interface ICategoryModel {
  depthLevel?: number;
  icon: string;
  iconColor?: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
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
    this.type = params.type;
  }

  static fromJSON(data: Record<string, unknown>): CategoryModel {
    return new CategoryModel({
      depthLevel:
        data.depth_level !== undefined && data.depth_level !== null
          ? Number(data.depth_level)
          : undefined,
      icon: data.icon as string,
      iconColor: (data.icon_color as string) ?? "black",
      id: data.id as string,
      name: data.name as string,
      owner: data.owner as OwnerType,
      ownerId: data.owner_id as string,
      parentId:
        data.parent_id !== undefined && data.parent_id !== null
          ? String(data.parent_id)
          : undefined,
      type: (data.type as string) ?? "EXPENSE",
    });
  }

  toJSON() {
    return {
      depth_level: this.depthLevel,
      icon: this.icon,
      icon_color: this.iconColor,
      id: this.id,
      name: this.name,
      owner: this.owner,
      owner_id: this.ownerId,
      parent_id: this.parentId,
      type: this.type,
    };
  }
}

export default CategoryModel;
