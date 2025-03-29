import { OwnerType } from "@domain/entities/user/OwnerEntity";

interface IStockOwnersDTO {
  id: string;
  name: string;
  type: OwnerType;
}

class OwnerDTO {
  id: string;
  name: string;
  type: OwnerType;

  constructor(params: IStockOwnersDTO) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
  }
}

export default OwnerDTO;
