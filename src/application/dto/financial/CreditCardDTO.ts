import CreditCardEntity from "@domain/entities/financial/CreditCardEntity";

export interface ICreditCardDTO {
  brand: string;
  closingDay: number;
  color: string;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: string;
  ownerId: string;
  paymentDay?: number;
  status: string;
  title: string;
}

class CreditCardDTO implements ICreditCardDTO {
  brand: string;
  closingDay: number;
  color: string;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: string;
  ownerId: string;
  paymentDay?: number;
  status: string;
  title: string;

  constructor(params: ICreditCardDTO) {
    this.brand = params.brand;
    this.closingDay = params.closingDay;
    this.color = params.color;
    this.dueDay = params.dueDay;
    this.id = params.id;
    this.lastDigits = params.lastDigits;
    this.limit = params.limit;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.paymentDay = params.paymentDay;
    this.status = params.status;
    this.title = params.title;
  }

  static fromEntity(entity: CreditCardEntity) {
    return new CreditCardDTO({
      brand: entity.brand,
      closingDay: entity.closingDay,
      color: entity.color,
      dueDay: entity.dueDay,
      id: entity.id,
      lastDigits: entity.lastDigits,
      limit: entity.limit,
      owner: entity.owner,
      ownerId: entity.ownerId,
      paymentDay: entity.paymentDay,
      status: entity.status,
      title: entity.title,
    });
  }
}

export default CreditCardDTO;
