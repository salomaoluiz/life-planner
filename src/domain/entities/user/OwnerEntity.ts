export enum OwnerType {
  FAMILY = "FAMILY",
  USER = "USER",
}

interface IOwnerEntity {
  archived?: boolean;
  name: string;
  ownerId: string;
  type: OwnerType;
}

class OwnerEntity {
  archived: boolean;
  name: string;
  ownerId: string;
  type: OwnerType;

  constructor(params: IOwnerEntity) {
    this.archived = params.archived ?? false;
    this.name = params.name;
    this.ownerId = params.ownerId;
    this.type = params.type;
  }
}

export default OwnerEntity;
