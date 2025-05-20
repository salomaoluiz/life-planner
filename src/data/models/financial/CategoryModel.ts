export type OwnerType = "FAMILY" | "USER";

interface ICategoryModel {
  depthLevel?: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;
}

class CategoryModel implements ICategoryModel {
  depthLevel?: number;
  icon: string;
  id: string;
  name: string;
  owner: OwnerType;
  ownerId: string;
  parentId?: string;

  constructor(params: ICategoryModel) {
    this.depthLevel = params.depthLevel;
    this.icon = params.icon;
    this.id = params.id;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.parentId = params.parentId;
  }

  static fromJSON(data: Record<string, unknown>): CategoryModel {
    return new CategoryModel({
      depthLevel: data.depth_level as number,
      icon: data.icon as string,
      id: data.id as string,
      name: data.name as string,
      owner: data.owner as OwnerType,
      ownerId: data.owner_id as string,
      parentId: data.parent_id as string,
    });
  }

  toJSON() {
    return {
      depth_level: this.depthLevel,
      icon: this.icon,
      id: this.id,
      name: this.name,
      owner: this.owner,
      owner_id: this.ownerId,
      parent_id: this.parentId,
    };
  }
}

export default CategoryModel;
