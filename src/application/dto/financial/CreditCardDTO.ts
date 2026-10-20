import CreditCardEntity, {
  PaymentAccountSummary,
} from "@domain/entities/financial/CreditCardEntity";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";

export interface ICreditCardDTO {
  brand: string;
  closingDay: number;
  color: string;
  currency?: CurrencyCode;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: string;
  ownerId: string;
  paymentAccount?: null | PaymentAccountSummary;
  paymentAccountId?: string;
  paymentDay?: number;
  status: string;
  title: string;
}

class CreditCardDTO implements ICreditCardDTO {
  brand: string;
  closingDay: number;
  color: string;
  currency: CurrencyCode;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: string;
  ownerId: string;
  paymentAccount?: null | PaymentAccountSummary;
  paymentAccountId?: string;
  paymentDay?: number;
  status: string;
  title: string;

  constructor(params: ICreditCardDTO) {
    this.brand = params.brand;
    this.closingDay = params.closingDay;
    this.color = params.color;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.dueDay = params.dueDay;
    this.id = params.id;
    this.lastDigits = params.lastDigits;
    this.limit = params.limit;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.paymentAccount = params.paymentAccount;
    this.paymentAccountId = params.paymentAccountId;
    this.paymentDay = params.paymentDay;
    this.status = params.status;
    this.title = params.title;
  }

  static fromEntity(entity: CreditCardEntity) {
    return new CreditCardDTO({
      brand: entity.brand,
      closingDay: entity.closingDay,
      color: entity.color,
      currency: entity.currency,
      dueDay: entity.dueDay,
      id: entity.id,
      lastDigits: entity.lastDigits,
      limit: entity.limit,
      owner: entity.owner,
      ownerId: entity.ownerId,
      paymentAccount: entity.paymentAccount,
      paymentAccountId: entity.paymentAccountId,
      paymentDay: entity.paymentDay,
      status: entity.status,
      title: entity.title,
    });
  }
}

export default CreditCardDTO;
