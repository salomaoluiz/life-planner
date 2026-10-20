import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { FamilyStatus } from "@domain/entities/family/FamilyStatus";

export interface IFamilyDTO {
  id: string;
  name: string;
  ownerId: string;
  status?: FamilyStatus;
}

class FamilyDTO {
  id: string;
  isArchived: boolean;
  name: string;
  ownerId: string;

  constructor(params: IFamilyDTO) {
    this.id = params.id;
    this.name = params.name;
    this.isArchived = params.status === FamilyStatus.ARCHIVED;
    this.ownerId = params.ownerId;
  }

  static fromEntity(entity: FamilyEntity) {
    return new FamilyDTO({
      id: entity.id,
      name: entity.name,
      ownerId: entity.ownerId,
      status: entity.status,
    });
  }
}

export default FamilyDTO;
