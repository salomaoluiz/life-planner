import TagEntity, { TagScope } from "@domain/entities/financial/TagEntity";

export interface ITagDTO {
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  scope?: TagScope;
  scopeOwnerIds?: string[];
  usageCount?: number;
}

class TagDTO {
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  scope: TagScope;
  scopeOwnerIds: string[];
  usageCount: number;

  constructor(params: ITagDTO) {
    this.id = params.id;
    this.name = params.name;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.scope = params.scope ?? "PERSONAL";
    this.scopeOwnerIds = params.scopeOwnerIds ?? [params.ownerId];
    this.usageCount = params.usageCount ?? 0;
  }

  static fromEntity(entity: TagEntity) {
    return new TagDTO({
      id: entity.id,
      name: entity.name,
      owner: entity.owner,
      ownerId: entity.ownerId,
      scope: entity.scope,
      scopeOwnerIds: entity.scopeOwnerIds,
      usageCount: entity.usageCount,
    });
  }
}

export default TagDTO;
