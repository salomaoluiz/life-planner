import FamilyEntity from "@domain/entities/family/FamilyEntity";

interface IFamilyDTO {
  id: string;
  name: string;
  ownerId: string;
}

class FamilyDTO {
  id: string;
  name: string;
  ownerId: string;

  constructor(params: IFamilyDTO) {
    this.id = params.id;
    this.name = params.name;
    this.ownerId = params.ownerId;
  }

  static fromEntity(entity: FamilyEntity) {
    return new FamilyDTO({
      id: entity.id,
      name: entity.name,
      ownerId: entity.ownerId,
    });
  }
}

export default FamilyDTO;
