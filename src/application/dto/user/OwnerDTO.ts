import OwnerEntity, { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface IOwnerDTO {
  id: string;
  name: string;
  type: OwnerType;
}

class OwnerDTO {
  id: string;
  name: string;
  type: OwnerType;

  constructor(params: IOwnerDTO) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
  }

  static fromEntity(entity: OwnerEntity): IOwnerDTO {
    return new OwnerDTO({
      id: entity.ownerId,
      name: entity.name,
      type: entity.type,
    });
  }
}

export default OwnerDTO;
