export enum OwnerType {
  FAMILY = "FAMILY",
  USER = "USER",
}

interface IOwnerEntity {
  name: string;
  ownerId: string;
  type: OwnerType;
}

class OwnerEntity {
  name: string;
  ownerId: string;
  type: OwnerType;

  constructor(params: IOwnerEntity) {
    this.name = params.name;
    this.ownerId = params.ownerId;
    this.type = params.type;
  }
}

export default OwnerEntity;
