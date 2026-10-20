import OwnerEntity, { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface IOwnerDTO {
  archived?: boolean;
  id: string;
  name: string;
  type: OwnerType;
}

class OwnerDTO {
  // An archived family is read-only and leaves the pickers and the "All" views (spec 042).
  archived: boolean;
  id: string;
  name: string;
  type: OwnerType;

  constructor(params: IOwnerDTO) {
    this.archived = params.archived ?? false;
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
  }

  static fromEntity(entity: OwnerEntity): IOwnerDTO {
    return new OwnerDTO({
      archived: entity.archived,
      id: entity.ownerId,
      name: entity.name,
      type: entity.type,
    });
  }
}

export default OwnerDTO;
