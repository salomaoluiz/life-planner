import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { CreditCardBrand } from "@domain/entities/financial/CreditCardEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

interface ICreditCardModel {
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

class CreditCardModel implements ICreditCardModel {
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

  constructor(params: ICreditCardModel) {
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

  // Money stays in cents (new slice, no legacy decimals).
  static fromJSON(data: Record<string, unknown>): CreditCardModel {
    return new CreditCardModel({
      brand: data.brand as CreditCardBrand,
      closingDay: Number(data.closingDay),
      color: data.color as string,
      dueDay: Number(data.dueDay),
      id: data.id as string,
      lastDigits: (data.lastDigits as string | undefined) ?? undefined,
      limit: Number(data.limit),
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      paymentDay:
        data.paymentDay === undefined || data.paymentDay === null
          ? undefined
          : Number(data.paymentDay),
      status: data.status as AccountStatus,
      title: data.title as string,
    });
  }
}

export default CreditCardModel;
