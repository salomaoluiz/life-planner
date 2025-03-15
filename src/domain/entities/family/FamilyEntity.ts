interface IFamilyEntity {
  id: string;
  name: string;
  ownerId: string;
}

class FamilyEntity {
  id: string;
  name: string;
  ownerId: string;

  constructor(params: IFamilyEntity) {
    this.id = params.id;
    this.name = params.name;
    this.ownerId = params.ownerId;
  }
}

export default FamilyEntity;
