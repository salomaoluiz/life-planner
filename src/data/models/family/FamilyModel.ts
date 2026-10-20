import { FamilyStatus } from "@domain/entities/family/FamilyStatus";

interface IFamilyModel {
  id: string;
  name: string;
  ownerId: string;
  status?: FamilyStatus;
}

class FamilyModel implements IFamilyModel {
  id: string;
  name: string;
  ownerId: string;
  status: FamilyStatus;

  constructor(params: IFamilyModel) {
    this.id = params.id;
    this.name = params.name;
    this.ownerId = params.ownerId;
    this.status = params.status ?? FamilyStatus.ACTIVE;
  }

  static fromJSON(data: Record<string, unknown>): FamilyModel {
    return new FamilyModel({
      id: data.id as string,
      name: data.name as string,
      ownerId: data.ownerId as string,
      // Older API versions did not send the status: the family is active.
      status:
        data.status === FamilyStatus.ARCHIVED
          ? FamilyStatus.ARCHIVED
          : FamilyStatus.ACTIVE,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      status: this.status,
    };
  }
}

export default FamilyModel;
