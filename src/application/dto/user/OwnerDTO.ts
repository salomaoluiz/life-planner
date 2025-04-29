import { OwnerType } from "@domain/entities/user/OwnerEntity";

interface IOwnersDTO {
  id: string;
  name: string;
  type: OwnerType;
}

class OwnerDTO {
  id: string;
  name: string;
  type: OwnerType;

  constructor(params: IOwnersDTO) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
  }
}

export default OwnerDTO;
