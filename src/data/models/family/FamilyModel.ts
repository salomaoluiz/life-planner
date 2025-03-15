interface IFamilyModel {
  id: string;
  name: string;
  ownerId: string;
}

class FamilyModel implements IFamilyModel {
  id: string;
  name: string;
  ownerId: string;

  constructor(params: IFamilyModel) {
    this.id = params.id;
    this.name = params.name;
    this.ownerId = params.ownerId;
  }

  static fromJSON(data: Record<string, unknown>): FamilyModel {
    return new FamilyModel({
      id: data.id as string,
      name: data.name as string,
      ownerId: data.owner_id as string,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      owner_id: this.ownerId,
    };
  }
}

export default FamilyModel;
