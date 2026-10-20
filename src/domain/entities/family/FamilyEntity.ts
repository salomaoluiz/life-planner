import { FamilyStatus } from "./FamilyStatus";

interface IFamilyEntity {
  id: string;
  name: string;
  ownerId: string;
  status?: FamilyStatus;
}

class FamilyEntity {
  id: string;
  name: string;
  ownerId: string;
  status: FamilyStatus;

  constructor(params: IFamilyEntity) {
    this.id = params.id;
    this.name = params.name;
    this.ownerId = params.ownerId;
    this.status = params.status ?? FamilyStatus.ACTIVE;
  }
}

export default FamilyEntity;
