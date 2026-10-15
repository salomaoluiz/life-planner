import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum CreditCardBrand {
  AMEX = "AMEX",
  ELO = "ELO",
  MASTERCARD = "MASTERCARD",
  OTHER = "OTHER",
  VISA = "VISA",
}

interface ICreditCardEntity {
  brand: CreditCardBrand;
  closingDay: number;
  color: string;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: OwnerType;
  ownerId: string;
  paymentDay?: number;
  status: AccountStatus;
  title: string;
}

class CreditCardEntity implements ICreditCardEntity {
  brand: CreditCardBrand;
  closingDay: number;
  color: string;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: OwnerType;
  ownerId: string;
  paymentDay?: number;
  status: AccountStatus;
  title: string;

  constructor(params: ICreditCardEntity) {
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
}

export default CreditCardEntity;
